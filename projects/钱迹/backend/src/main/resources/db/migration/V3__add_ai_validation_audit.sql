ALTER TABLE ai_analysis_records
    ADD COLUMN validation_status VARCHAR(32) NULL COMMENT 'VALIDATED、FALLBACK或REJECTED' AFTER status,
    ADD COLUMN validator_version VARCHAR(32) NULL COMMENT '后端校验规则版本' AFTER validation_status,
    ADD COLUMN result_source VARCHAR(32) NULL COMMENT 'MODEL_VALIDATED或RULE_FALLBACK' AFTER validator_version,
    ADD COLUMN result_digest CHAR(64) NULL COMMENT '校验后结果摘要，不保存模型原文' AFTER result_source;
