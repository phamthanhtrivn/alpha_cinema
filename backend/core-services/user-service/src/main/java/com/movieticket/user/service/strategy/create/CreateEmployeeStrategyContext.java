package com.movieticket.user.service.strategy.create;

import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class CreateEmployeeStrategyContext {

    private final Map<EmployeeRole, CreateEmployeeStrategy> strategyMap;

    public CreateEmployeeStrategyContext(List<CreateEmployeeStrategy> strategies) {
        this.strategyMap = Collections.unmodifiableMap(
                strategies.stream()
                        .collect(Collectors.toMap(
                                CreateEmployeeStrategy::getSupportedRole,
                                Function.identity(),
                                (a, b) -> {
                                    throw new IllegalStateException(
                                            "Duplicate strategy for role: " + a.getSupportedRole()
                                    );
                                }
                        ))
        );
    }

    public CreateEmployeeStrategy getStrategy(EmployeeRole role) {
        CreateEmployeeStrategy strategy = strategyMap.get(role);

        if (strategy == null) {
            throw new BusinessException("Role không có quyền tạo employee: " + role);
        }

        return strategy;
    }
}