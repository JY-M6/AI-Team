package com.qianji.ledger;

public record CategoryResponse(
        String id,
        String type,
        String code,
        String name,
        String icon,
        String color,
        boolean system,
        int sortOrder
) {
    static CategoryResponse from(CategoryEntity category) {
        return new CategoryResponse(
                category.id().toString(),
                category.type(),
                category.code(),
                category.name(),
                category.icon(),
                category.color(),
                category.isSystem(),
                category.sortOrder()
        );
    }
}
