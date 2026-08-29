package com.qianji.ai.validation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 将不可信的模型原文转换为经过验证的结构化结果。 */
@Component
public final class AiModelOutputValidator {

    public static final String INVESTMENT_RISK_NOTICE =
            "以下内容仅供参考，不构成投资建议。理财产品存在风险，请结合自身情况谨慎决策。";

    private static final int MAX_RAW_LENGTH = 16_384;
    private static final int MAX_SUMMARY_LENGTH = 300;
    private static final int MAX_SUGGESTION_LENGTH = 200;
    private static final int MAX_SUGGESTIONS = 5;
    private static final Set<String> ALLOWED_FIELDS =
            Set.of("summary", "suggestions", "riskNotice", "evidenceKeys");
    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
            "(?:[¥￥]\\s*(\\d+(?:\\.\\d{1,2})?)|(\\d+(?:\\.\\d{1,2})?)\\s*元)"
    );
    private static final Pattern UNSAFE_CONTENT = Pattern.compile(
            "(?i)<[^>]+>|javascript:|data:text/html|https?://|系统提示词|system\\s+prompt|developer\\s+message|忽略以上指令"
    );
    private static final List<String> PROHIBITED_FINANCIAL_CLAIMS = List.of(
            "保证收益", "稳赚", "保本保收益", "一定上涨", "必然上涨", "立即买入", "立即卖出", "代你购买", "自动转账"
    );

    private final ObjectMapper objectMapper;

    public AiModelOutputValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AiValidationResult validate(String rawOutput, AiValidationContext context) {
        List<String> errors = new ArrayList<>();
        if (rawOutput == null || rawOutput.isBlank() || rawOutput.length() > MAX_RAW_LENGTH) {
            return AiValidationResult.rejected(List.of("MODEL_OUTPUT_LENGTH_INVALID"));
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(rawOutput);
        } catch (JsonProcessingException exception) {
            return AiValidationResult.rejected(List.of("MODEL_OUTPUT_JSON_INVALID"));
        }

        if (!root.isObject() || hasUnknownFields(root)) {
            return AiValidationResult.rejected(List.of("MODEL_OUTPUT_SCHEMA_INVALID"));
        }

        String summary = requiredText(root, "summary", MAX_SUMMARY_LENGTH, errors);
        List<String> suggestions = requiredTextArray(root, "suggestions", MAX_SUGGESTIONS,
                MAX_SUGGESTION_LENGTH, errors);
        String riskNotice = optionalText(root, "riskNotice", 200, errors);
        List<String> evidenceKeys = requiredTextArray(root, "evidenceKeys", 20, 64, errors);

        List<String> allText = new ArrayList<>();
        allText.add(summary);
        allText.addAll(suggestions);
        if (riskNotice != null) {
            allText.add(riskNotice);
        }
        validateSafety(allText, errors);
        validateEvidence(evidenceKeys, context.allowedEvidenceKeys(), errors);
        validateAmounts(allText, context.allowedAmounts(), errors);
        if (context.wealthRelated() && !INVESTMENT_RISK_NOTICE.equals(riskNotice)) {
            errors.add("MODEL_OUTPUT_RISK_NOTICE_MISSING");
        }

        if (!errors.isEmpty()) {
            return AiValidationResult.rejected(errors.stream().distinct().toList());
        }
        return AiValidationResult.accepted(new AiValidatedOutput(
                summary, List.copyOf(suggestions), riskNotice, List.copyOf(evidenceKeys)
        ));
    }

    private boolean hasUnknownFields(JsonNode root) {
        Iterator<String> fields = root.fieldNames();
        while (fields.hasNext()) {
            if (!ALLOWED_FIELDS.contains(fields.next())) {
                return true;
            }
        }
        return false;
    }

    private String requiredText(JsonNode root, String field, int maxLength, List<String> errors) {
        JsonNode node = root.get(field);
        if (node == null || !node.isTextual() || node.textValue().isBlank()
                || node.textValue().length() > maxLength) {
            errors.add("MODEL_OUTPUT_SCHEMA_INVALID");
            return "";
        }
        return node.textValue().trim();
    }

    private String optionalText(JsonNode root, String field, int maxLength, List<String> errors) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isTextual() || node.textValue().length() > maxLength) {
            errors.add("MODEL_OUTPUT_SCHEMA_INVALID");
            return null;
        }
        return node.textValue().trim();
    }

    private List<String> requiredTextArray(
            JsonNode root, String field, int maxItems, int maxItemLength, List<String> errors
    ) {
        JsonNode node = root.get(field);
        if (node == null || !node.isArray() || node.isEmpty() || node.size() > maxItems) {
            errors.add("MODEL_OUTPUT_SCHEMA_INVALID");
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            if (!item.isTextual() || item.textValue().isBlank()
                    || item.textValue().length() > maxItemLength) {
                errors.add("MODEL_OUTPUT_SCHEMA_INVALID");
                continue;
            }
            values.add(item.textValue().trim());
        }
        return values;
    }

    private void validateSafety(List<String> texts, List<String> errors) {
        String combined = String.join("\n", texts);
        if (UNSAFE_CONTENT.matcher(combined).find()) {
            errors.add("MODEL_OUTPUT_UNSAFE");
        }
        String normalized = combined.toLowerCase(Locale.ROOT);
        if (PROHIBITED_FINANCIAL_CLAIMS.stream().anyMatch(normalized::contains)) {
            errors.add("MODEL_OUTPUT_FINANCIAL_CLAIM_PROHIBITED");
        }
    }

    private void validateEvidence(List<String> evidenceKeys, Set<String> allowedKeys, List<String> errors) {
        if (evidenceKeys.isEmpty() || !allowedKeys.containsAll(new HashSet<>(evidenceKeys))) {
            errors.add("MODEL_OUTPUT_EVIDENCE_INVALID");
        }
    }

    private void validateAmounts(List<String> texts, Set<BigDecimal> allowedAmounts, List<String> errors) {
        for (String text : texts) {
            Matcher matcher = AMOUNT_PATTERN.matcher(text);
            while (matcher.find()) {
                String value = matcher.group(1) == null ? matcher.group(2) : matcher.group(1);
                BigDecimal amount = new BigDecimal(value).stripTrailingZeros();
                boolean allowed = allowedAmounts.stream()
                        .map(BigDecimal::stripTrailingZeros)
                        .anyMatch(amount::equals);
                if (!allowed) {
                    errors.add("MODEL_OUTPUT_FACT_MISMATCH");
                    return;
                }
            }
        }
    }
}
