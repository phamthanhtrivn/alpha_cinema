package com.movieticket.ai.service;

import com.movieticket.ai.dto.request.PolicyRequest;
import com.movieticket.ai.dto.response.PolicyResponse;
import com.movieticket.ai.dto.response.PolicySyncResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private static final int POLICY_CHUNK_SIZE = 1000;

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public PolicySyncResponse reIngestPolicyFiles() {
        List<Document> documents = new ArrayList<>();
        int policyCount = 0;

        for (SeedPolicy seedPolicy : loadPolicyDocuments()) {
            deletePolicyChunks(seedPolicy.policyId(), seedPolicy.source());
            documents.addAll(seedPolicy.documents());
            policyCount++;
        }

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
        }

        return new PolicySyncResponse(policyCount, documents.size());
    }

    public List<String> searchPolicy(String query) {
        return searchPolicyDocuments(query, 5)
                .stream()
                .map(Document::getText)
                .toList();
    }

    public List<Document> searchPolicyDocuments(String query, int topK) {
        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(query)
                        .topK(topK)
                        .filterExpression("type == 'policy' && active == true")
                        .build()
        );
    }

    public List<PolicyResponse> getPolicies(String keyword, String topic, Boolean active, String source) {
        List<Object> params = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                SELECT
                    COALESCE(metadata->>'policyId', metadata->>'source', id::text) AS policy_id,
                    COALESCE(MAX(metadata->>'title'), MAX(metadata->>'source'), 'Untitled policy') AS title,
                    COALESCE(MAX(metadata->>'topic'), 'general') AS topic,
                    COALESCE(MAX(metadata->>'source'), 'admin') AS source,
                    BOOL_OR(COALESCE(NULLIF(metadata->>'active', '')::boolean, true)) AS active,
                    COUNT(*) AS chunk_count,
                    MIN(metadata->>'createdAt') AS created_at,
                    MAX(metadata->>'updatedAt') AS updated_at,
                    STRING_AGG(content, E'\\n\\n' ORDER BY COALESCE(NULLIF(metadata->>'chunkIndex', '')::int, 0)) AS content
                FROM ai_knowledge_documents
                WHERE metadata->>'type' = 'policy'
                """);

        if (StringUtils.hasText(keyword)) {
            sql.append("""
                    AND (
                        LOWER(content) LIKE ?
                        OR LOWER(COALESCE(metadata->>'title', '')) LIKE ?
                        OR LOWER(COALESCE(metadata->>'topic', '')) LIKE ?
                        OR LOWER(COALESCE(metadata->>'source', '')) LIKE ?
                    )
                    """);
            String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
            params.add(likeKeyword);
        }

        if (StringUtils.hasText(topic)) {
            sql.append("AND LOWER(COALESCE(metadata->>'topic', 'general')) = ?\n");
            params.add(topic.trim().toLowerCase());
        }

        if (StringUtils.hasText(source)) {
            sql.append("AND LOWER(COALESCE(metadata->>'source', 'admin')) LIKE ?\n");
            params.add("%" + source.trim().toLowerCase() + "%");
        }

        if (active != null) {
            sql.append("AND COALESCE(NULLIF(metadata->>'active', '')::boolean, true) = ?\n");
            params.add(active);
        }

        sql.append("""
                GROUP BY COALESCE(metadata->>'policyId', metadata->>'source', id::text)
                ORDER BY MAX(COALESCE(metadata->>'updatedAt', metadata->>'createdAt', '')) DESC,
                         COALESCE(MAX(metadata->>'title'), MAX(metadata->>'source'), 'Untitled policy') ASC
                """);

        return jdbcTemplate.query(sql.toString(), policyRowMapper(), params.toArray());
    }

    public PolicyResponse createPolicy(PolicyRequest request) {
        String policyId = UUID.randomUUID().toString();
        String now = Instant.now().toString();
        addPolicyDocuments(
                policyId,
                normalize(request.getTitle()),
                normalizeTopic(request.getTopic()),
                "admin",
                normalize(request.getContent()),
                Objects.requireNonNullElse(request.getActive(), true),
                now
        );
        return getPolicy(policyId);
    }

    public PolicyResponse updatePolicy(String policyId, PolicyRequest request) {
        PolicyResponse existingPolicy = getPolicy(policyId);
        deletePolicyChunks(policyId, existingPolicy.source());
        addPolicyDocuments(
                policyId,
                normalize(request.getTitle()),
                normalizeTopic(request.getTopic()),
                StringUtils.hasText(existingPolicy.source()) ? existingPolicy.source() : "admin",
                normalize(request.getContent()),
                Objects.requireNonNullElse(request.getActive(), true),
                StringUtils.hasText(existingPolicy.createdAt()) ? existingPolicy.createdAt() : Instant.now().toString()
        );
        return getPolicy(policyId);
    }

    public void deletePolicy(String policyId) {
        PolicyResponse existingPolicy = getPolicy(policyId);
        int deletedCount = deletePolicyChunks(policyId, existingPolicy.source());
        if (deletedCount == 0) {
            throw new IllegalArgumentException("Policy not found");
        }
    }

    private PolicyResponse getPolicy(String policyId) {
        return getPolicies(null, null, null, null)
                .stream()
                .filter(policy -> policy.id().equals(policyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
    }

    private void addPolicyDocuments(
            String policyId,
            String title,
            String topic,
            String source,
            String content,
            boolean active,
            String createdAt
    ) {
        String updatedAt = Instant.now().toString();
        List<String> chunks = splitText(content, POLICY_CHUNK_SIZE);
        List<Document> documents = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            documents.add(new Document(
                    UUID.randomUUID().toString(),
                    chunks.get(i),
                    Map.of(
                            "type", "policy",
                            "policyId", policyId,
                            "title", title,
                            "source", source,
                            "topic", topic,
                            "chunkIndex", i,
                            "active", active,
                            "createdAt", createdAt,
                            "updatedAt", updatedAt
                    )
            ));
        }

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
        }
    }

    private int deletePolicyChunks(String policyId, String source) {
        return jdbcTemplate.update("""
                DELETE FROM ai_knowledge_documents
                WHERE metadata->>'type' = 'policy'
                  AND (
                      metadata->>'policyId' = ?
                      OR (? <> '' AND metadata->>'source' = ? AND metadata->>'policyId' IS NULL)
                  )
                """, policyId, Objects.requireNonNullElse(source, ""), Objects.requireNonNullElse(source, ""));
    }

    private RowMapper<PolicyResponse> policyRowMapper() {
        return (rs, rowNum) -> new PolicyResponse(
                rs.getString("policy_id"),
                rs.getString("title"),
                rs.getString("topic"),
                rs.getString("source"),
                rs.getString("content"),
                rs.getBoolean("active"),
                rs.getInt("chunk_count"),
                rs.getString("created_at"),
                rs.getString("updated_at")
        );
    }

    private List<SeedPolicy> loadPolicyDocuments() {
        try {
            PathMatchingResourcePatternResolver resolver =
                    new PathMatchingResourcePatternResolver();

            Resource[] resources = resolver.getResources("classpath:/policies/*.txt");

            List<SeedPolicy> policies = new ArrayList<>();

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                String content = resource.getContentAsString(StandardCharsets.UTF_8);
                String source = filename != null ? filename : "unknown";
                String topic = detectTopic(filename);
                String title = source.replace(".txt", "").replace("-", " ");
                String policyId = "seed-" + source.replaceAll("[^a-zA-Z0-9_-]", "-");
                String now = Instant.now().toString();
                List<String> chunks = splitText(content, POLICY_CHUNK_SIZE);
                List<Document> documents = new ArrayList<>();

                for (int i = 0; i < chunks.size(); i++) {
                    Document document = new Document(
                            UUID.randomUUID().toString(),
                            chunks.get(i),
                            Map.of(
                                    "type", "policy",
                                    "policyId", policyId,
                                    "title", title,
                                    "source", source,
                                    "topic", topic,
                                    "chunkIndex", i,
                                    "active", true,
                                    "createdAt", now,
                                    "updatedAt", now
                            )
                    );

                    documents.add(document);
                }

                policies.add(new SeedPolicy(policyId, source, documents));
            }

            return policies;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load policy documents", e);
        }
    }

    private List<String> splitText(String text, int maxLength) {
        List<String> chunks = new ArrayList<>();

        String[] paragraphs = text.split("\\n\\s*\\n");
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            String normalizedParagraph = paragraph.trim();

            if (normalizedParagraph.isBlank()) {
                continue;
            }

            if (current.length() + normalizedParagraph.length() > maxLength) {
                if (!current.isEmpty()) {
                    chunks.add(current.toString().trim());
                    current.setLength(0);
                }
            }

            current.append(normalizedParagraph).append("\n\n");
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        return chunks;
    }

    private String detectTopic(String filename) {
        if (filename == null) {
            return "general";
        }

        String lowerFilename = filename.toLowerCase();

        if (lowerFilename.contains("refund")) {
            return "refund";
        }

        if (lowerFilename.contains("booking")) {
            return "booking";
        }

        if (lowerFilename.contains("payment")) {
            return "payment";
        }

        if (lowerFilename.contains("loyalty")) {
            return "loyalty";
        }

        if (lowerFilename.contains("discount") || lowerFilename.contains("promotion")) {
            return "promotion";
        }

        if (lowerFilename.contains("combo") || lowerFilename.contains("product")) {
            return "product_combo";
        }

        if (lowerFilename.contains("review")) {
            return "review";
        }

        if (lowerFilename.contains("privacy")) {
            return "privacy";
        }

        if (lowerFilename.contains("qr")) {
            return "qr_code";
        }

        if (lowerFilename.contains("pricing") || lowerFilename.contains("ticket-price")) {
            return "ticket_pricing";
        }

        if (lowerFilename.contains("cinema") || lowerFilename.contains("branch")) {
            return "cinema_branch";
        }

        if (lowerFilename.contains("movie")) {
            return "movie_information";
        }

        if (lowerFilename.contains("customer") || lowerFilename.contains("account")) {
            return "customer_account";
        }

        return "general";
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Policy value must not be blank");
        }
        return value.trim();
    }

    private String normalizeTopic(String value) {
        return normalize(value).toLowerCase();
    }

    private record SeedPolicy(String policyId, String source, List<Document> documents) {
    }
}
