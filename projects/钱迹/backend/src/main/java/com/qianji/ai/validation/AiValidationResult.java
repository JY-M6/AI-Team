package com.qianji.ai.validation;

import java.util.List;

/** AI 输出校验结果；失败时不保留或暴露模型原文。 */
public record AiValidationResult(
        boolean valid,
        AiValidatedOutput output,
        List<String> errorCodes
) {
    public static AiValidationResult accepted(AiValidatedOutput output) {
        return new AiValidationResult(true, output, List.of());
    }

    public static AiValidationResult rejected(List<String> errorCodes) {
        return new AiValidationResult(false, null, List.copyOf(errorCodes));
    }
}
