package com.movieticket.ai.controller;

import com.movieticket.ai.common.ApiResponse;
import com.movieticket.ai.dto.request.PolicyRequest;
import com.movieticket.ai.dto.response.PolicyResponse;
import com.movieticket.ai.dto.response.PolicySyncResponse;
import com.movieticket.ai.service.KnowledgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    @PostMapping("/ingest-policies")
    public String ingestPolicies() {
        PolicySyncResponse response = knowledgeService.reIngestPolicyFiles();
        return "Inserted " + response.chunkCount() + " policy document chunks into pgvector";
    }

    @GetMapping("/search")
    public List<String> searchPolicy(@RequestParam String query) {
        return knowledgeService.searchPolicy(query);
    }

    @GetMapping("/admin/policies")
    public ApiResponse<List<PolicyResponse>> getPolicies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String source
    ) {
        List<PolicyResponse> response = knowledgeService.getPolicies(keyword, topic, active, source);
        return ApiResponse.success(response, "Fetched AI policies successfully");
    }

    @PostMapping("/admin/policies")
    public ApiResponse<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        PolicyResponse response = knowledgeService.createPolicy(request);
        return ApiResponse.success(response, "Created AI policy successfully");
    }

    @PutMapping("/admin/policies/{policyId}")
    public ApiResponse<PolicyResponse> updatePolicy(
            @PathVariable String policyId,
            @Valid @RequestBody PolicyRequest request
    ) {
        PolicyResponse response = knowledgeService.updatePolicy(policyId, request);
        return ApiResponse.success(response, "Updated AI policy successfully");
    }

    @DeleteMapping("/admin/policies/{policyId}")
    public ApiResponse<Void> deletePolicy(@PathVariable String policyId) {
        knowledgeService.deletePolicy(policyId);
        return ApiResponse.success(null, "Deleted AI policy successfully");
    }

    @PostMapping("/admin/policies/sync")
    public ApiResponse<PolicySyncResponse> syncPolicies() {
        PolicySyncResponse response = knowledgeService.reIngestPolicyFiles();
        return ApiResponse.success(response, "Synced policy files successfully");
    }
}
