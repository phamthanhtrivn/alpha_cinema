package com.movieticket.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public int reIngestPolicyFiles() {
        jdbcTemplate.update("""
                DELETE FROM ai_knowledge_documents
                WHERE metadata->>'type' = 'policy'
                """);

        List<Document> documents = loadPolicyDocuments();

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
        }

        return documents.size();
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

    private List<Document> loadPolicyDocuments() {
        try {
            PathMatchingResourcePatternResolver resolver =
                    new PathMatchingResourcePatternResolver();

            Resource[] resources = resolver.getResources("classpath:/policies/*.txt");

            List<Document> documents = new ArrayList<>();

            for (Resource resource : resources) {
                String filename = resource.getFilename();
                String content = resource.getContentAsString(StandardCharsets.UTF_8);

                List<String> chunks = splitText(content, 1000);

                for (int i = 0; i < chunks.size(); i++) {
                    Document document = new Document(
                            UUID.randomUUID().toString(),
                            chunks.get(i),
                            Map.of(
                                    "type", "policy",
                                    "source", filename != null ? filename : "unknown",
                                    "topic", detectTopic(filename),
                                    "chunkIndex", i,
                                    "active", true
                            )
                    );

                    documents.add(document);
                }
            }

            return documents;
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
}
