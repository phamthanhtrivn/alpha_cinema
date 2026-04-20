package com.movieticket.user.service.strategy.update;

import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class UpdateEmployeeStrategyContext {

    private final Map<EmployeeRole, UpdateEmployeeStrategy> strategyMap;

    public UpdateEmployeeStrategyContext(List<UpdateEmployeeStrategy> strategies) {
        this.strategyMap = Collections.unmodifiableMap(
                strategies.stream()
                        .collect(Collectors.toMap(
                                UpdateEmployeeStrategy::getSupportedRole,
                                Function.identity(),
                                (a, b) -> {
                                    throw new IllegalStateException(
                                            "Duplicate strategy for role: " + a.getSupportedRole()
                                    );
                                }
                        ))
        );
    }

    public UpdateEmployeeStrategy getStrategy(EmployeeRole role) {
        UpdateEmployeeStrategy strategy = strategyMap.get(role);

        if (strategy == null) {
            throw new BusinessException("Role không có quyền update employee: " + role);
        }

        return strategy;
    }
}