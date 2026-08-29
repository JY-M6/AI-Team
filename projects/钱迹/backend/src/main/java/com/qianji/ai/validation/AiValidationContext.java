package com.qianji.ai.validation;

import java.math.BigDecimal;
import java.util.Set;

/** 后端确定性计算得到的事实边界，模型只能引用这些事实。 */
public record AiValidationContext(
        Set<String> allowedEvidenceKeys,
        Set<BigDecimal> allowedAmounts,
        boolean wealthRelated
) {
    public AiValidationContext {
        allowedEvidenceKeys = Set.copyOf(allowedEvidenceKeys);
        allowedAmounts = Set.copyOf(allowedAmounts);
    }
}
