package com.qianji.ai.validation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class AiModelOutputValidatorTests {

    private AiModelOutputValidator validator;

    @BeforeEach
    void 初始化校验器() {
        validator = new AiModelOutputValidator(new ObjectMapper());
    }

    @Test
    void 合法消费分析应通过校验() {
        AiValidationResult result = validator.validate("""
                {
                  "summary": "今日支出42元，餐饮占比较高。",
                  "suggestions": ["下次可以先查看本周餐饮预算。"],
                  "riskNotice": null,
                  "evidenceKeys": ["daily.expense", "category.food.ratio"]
                }
                """, context(false));

        assertThat(result.valid()).isTrue();
        assertThat(result.output().summary()).contains("42元");
    }

    @Test
    void 畸形Json和额外字段应被拒绝() {
        assertThat(validator.validate("不是 JSON", context(false)).errorCodes())
                .contains("MODEL_OUTPUT_JSON_INVALID");
        assertThat(validator.validate("""
                {"summary":"正常","suggestions":["建议"],"riskNotice":null,
                 "evidenceKeys":["daily.expense"],"command":"DELETE"}
                """, context(false)).errorCodes()).contains("MODEL_OUTPUT_SCHEMA_INVALID");
    }

    @Test
    void 虚构金额和证据应被拒绝() {
        AiValidationResult result = validator.validate("""
                {
                  "summary": "今日支出999元。",
                  "suggestions": ["减少消费。"],
                  "riskNotice": null,
                  "evidenceKeys": ["invented.fact"]
                }
                """, context(false));

        assertThat(result.errorCodes())
                .contains("MODEL_OUTPUT_FACT_MISMATCH", "MODEL_OUTPUT_EVIDENCE_INVALID");
    }

    @Test
    void 危险内容和投资承诺应被拒绝() {
        AiValidationResult unsafe = validator.validate("""
                {"summary":"<script>alert(1)</script>","suggestions":["建议"],
                 "riskNotice":null,"evidenceKeys":["daily.expense"]}
                """, context(false));
        AiValidationResult claim = validator.validate("""
                {"summary":"该产品保证收益。","suggestions":["立即买入"],
                 "riskNotice":"%s","evidenceKeys":["daily.expense"]}
                """.formatted(AiModelOutputValidator.INVESTMENT_RISK_NOTICE), context(true));

        assertThat(unsafe.errorCodes()).contains("MODEL_OUTPUT_UNSAFE");
        assertThat(claim.errorCodes()).contains("MODEL_OUTPUT_FINANCIAL_CLAIM_PROHIBITED");
    }

    @Test
    void 理财分析缺少标准风险提示应被拒绝() {
        AiValidationResult result = validator.validate("""
                {"summary":"该产品波动较高。","suggestions":["先核对风险承受能力。"],
                 "riskNotice":null,"evidenceKeys":["daily.expense"]}
                """, context(true));

        assertThat(result.errorCodes()).contains("MODEL_OUTPUT_RISK_NOTICE_MISSING");
    }

    private AiValidationContext context(boolean wealthRelated) {
        return new AiValidationContext(
                Set.of("daily.expense", "category.food.ratio"),
                Set.of(new BigDecimal("42.00")),
                wealthRelated
        );
    }
}
