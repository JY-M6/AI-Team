package com.qianji.ai.validation;

import java.util.List;

/** 已通过后端校验、允许返回给客户端的 AI 分析结果。 */
public record AiValidatedOutput(
        String summary,
        List<String> suggestions,
        String riskNotice,
        List<String> evidenceKeys
) {
}
