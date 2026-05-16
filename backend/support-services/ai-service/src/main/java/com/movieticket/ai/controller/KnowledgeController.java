package com.movieticket.ai.controller;

import com.movieticket.ai.service.KnowledgeService;
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
        int insertedCount = knowledgeService.reIngestPolicyFiles();
        return "Inserted " + insertedCount + " policy document chunks into pgvector";
    }

    @GetMapping("/search")
    public List<String> searchPolicy(@RequestParam String query) {
        return knowledgeService.searchPolicy(query);
    }
}
