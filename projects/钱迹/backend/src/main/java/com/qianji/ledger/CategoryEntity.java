package com.qianji.ledger;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("categories")
public record CategoryEntity(
        @Id Long id,
        Long userId,
        Long parentId,
        String type,
        String code,
        String name,
        String icon,
        String color,
        boolean isSystem,
        String status,
        int sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
}
