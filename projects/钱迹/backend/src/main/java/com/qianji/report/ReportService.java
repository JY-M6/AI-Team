package com.qianji.report;

import com.qianji.common.exception.BusinessException;
import com.qianji.ledger.LedgerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ReportService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");
    private static final Set<String> GRANULARITIES = Set.of("DAY", "WEEK", "MONTH", "YEAR");

    private final LedgerRepository ledgerRepository;
    private final DatabaseClient databaseClient;

    public ReportService(LedgerRepository ledgerRepository, DatabaseClient databaseClient) {
        this.ledgerRepository = ledgerRepository;
        this.databaseClient = databaseClient;
    }

    public Mono<ReportResponses.Summary> summary(
            Long userId,
            Long ledgerId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        return load(userId, ledgerId, startAt, endAt)
                .collectList()
                .map(this::summarize);
    }

    public Flux<ReportResponses.TrendPoint> trend(
            Long userId,
            Long ledgerId,
            String granularity,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        validateGranularity(granularity);
        return load(userId, ledgerId, startAt, endAt)
                .collectList()
                .flatMapMany(rows -> Flux.fromIterable(groupTrend(rows, granularity)));
    }

    public Flux<ReportResponses.CategoryItem> categories(
            Long userId,
            Long ledgerId,
            String type,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        if (!Set.of("EXPENSE", "INCOME").contains(type)) {
            return Flux.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "type只支持EXPENSE或INCOME"));
        }
        return load(userId, ledgerId, startAt, endAt)
                .filter(row -> row.type().equals(type))
                .collectList()
                .flatMapMany(rows -> Flux.fromIterable(groupCategories(rows)));
    }

    public Mono<ReportResponses.MonthlyCalendar> calendar(
            Long userId,
            Long ledgerId,
            String month
    ) {
        final YearMonth yearMonth;
        try {
            yearMonth = YearMonth.parse(month);
        } catch (RuntimeException exception) {
            return Mono.error(new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "month格式必须为yyyy-MM"));
        }
        OffsetDateTime start = yearMonth.atDay(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        OffsetDateTime end = yearMonth.plusMonths(1).atDay(1)
                .atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();
        return load(userId, ledgerId, start, end)
                .collectList()
                .map(rows -> buildCalendar(yearMonth, rows));
    }

    private Flux<ReportRow> load(
            Long userId,
            Long ledgerId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        validateRange(startAt, endAt);
        return ledgerRepository
                .findByIdAndUserIdAndStatusAndDeletedAtIsNull(ledgerId, userId, "ACTIVE")
                .switchIfEmpty(Mono.error(new BusinessException(
                        HttpStatus.NOT_FOUND, "NOT_FOUND", "账本不存在")))
                .thenMany(databaseClient.sql("""
                                SELECT t.type, t.category_id, c.name AS category_name,
                                       t.amount, t.occurred_at
                                FROM transactions t
                                LEFT JOIN categories c ON c.id = t.category_id
                                WHERE t.user_id = :userId AND t.ledger_id = :ledgerId
                                  AND t.type IN ('EXPENSE', 'INCOME')
                                  AND t.status = 'CONFIRMED' AND t.deleted_at IS NULL
                                  AND t.occurred_at >= :startAt AND t.occurred_at < :endAt
                                ORDER BY t.occurred_at, t.id
                                """)
                        .bind("userId", userId)
                        .bind("ledgerId", ledgerId)
                        .bind("startAt", localDateTime(startAt))
                        .bind("endAt", localDateTime(endAt))
                        .map((row, metadata) -> new ReportRow(
                                row.get("type", String.class),
                                number(row.get("category_id", Number.class)),
                                row.get("category_name", String.class),
                                row.get("amount", BigDecimal.class),
                                row.get("occurred_at", LocalDateTime.class)
                        ))
                        .all());
    }

    private ReportResponses.Summary summarize(List<ReportRow> rows) {
        BigDecimal income = total(rows, "INCOME");
        BigDecimal expense = total(rows, "EXPENSE");
        return new ReportResponses.Summary(
                income, expense, income.subtract(expense), rows.size());
    }

    private List<ReportResponses.TrendPoint> groupTrend(List<ReportRow> rows, String granularity) {
        Map<String, List<ReportRow>> grouped = new LinkedHashMap<>();
        rows.stream()
                .sorted(Comparator.comparing(ReportRow::occurredAt))
                .forEach(row -> grouped.computeIfAbsent(
                        bucket(row.occurredAt().toLocalDate(), granularity), key -> new ArrayList<>())
                        .add(row));
        return grouped.entrySet().stream()
                .map(entry -> {
                    ReportResponses.Summary summary = summarize(entry.getValue());
                    return new ReportResponses.TrendPoint(
                            entry.getKey(),
                            summary.income(),
                            summary.expense(),
                            summary.balance(),
                            summary.transactionCount());
                })
                .toList();
    }

    private List<ReportResponses.CategoryItem> groupCategories(List<ReportRow> rows) {
        BigDecimal total = rows.stream()
                .map(ReportRow::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<Long, List<ReportRow>> grouped = new LinkedHashMap<>();
        rows.forEach(row -> grouped.computeIfAbsent(row.categoryId(), key -> new ArrayList<>()).add(row));
        return grouped.entrySet().stream()
                .map(entry -> {
                    List<ReportRow> categoryRows = entry.getValue();
                    BigDecimal amount = categoryRows.stream()
                            .map(ReportRow::amount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal percentage = total.signum() == 0
                            ? BigDecimal.ZERO
                            : amount.multiply(BigDecimal.valueOf(100))
                                    .divide(total, 2, RoundingMode.HALF_UP);
                    ReportRow first = categoryRows.getFirst();
                    return new ReportResponses.CategoryItem(
                            first.categoryId().toString(),
                            first.categoryName(),
                            amount,
                            percentage,
                            categoryRows.size());
                })
                .sorted(Comparator.comparing(ReportResponses.CategoryItem::amount).reversed())
                .toList();
    }

    private ReportResponses.MonthlyCalendar buildCalendar(YearMonth month, List<ReportRow> rows) {
        Map<LocalDate, List<ReportRow>> grouped = new LinkedHashMap<>();
        rows.forEach(row -> grouped.computeIfAbsent(
                row.occurredAt().toLocalDate(), key -> new ArrayList<>()).add(row));
        List<ReportResponses.CalendarDay> days = grouped.entrySet().stream()
                .map(entry -> new ReportResponses.CalendarDay(
                        entry.getKey(),
                        total(entry.getValue(), "INCOME"),
                        total(entry.getValue(), "EXPENSE"),
                        entry.getValue().size()))
                .sorted(Comparator.comparing(ReportResponses.CalendarDay::date))
                .toList();
        return new ReportResponses.MonthlyCalendar(
                month.toString(), total(rows, "INCOME"), total(rows, "EXPENSE"), days);
    }

    private BigDecimal total(List<ReportRow> rows, String type) {
        return rows.stream()
                .filter(row -> row.type().equals(type))
                .map(ReportRow::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String bucket(LocalDate date, String granularity) {
        return switch (granularity) {
            case "DAY" -> date.toString();
            case "WEEK" -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toString();
            case "MONTH" -> YearMonth.from(date).toString();
            case "YEAR" -> Integer.toString(date.getYear());
            default -> throw new IllegalArgumentException("不支持的统计粒度");
        };
    }

    private void validateGranularity(String granularity) {
        if (!GRANULARITIES.contains(granularity)) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "granularity不支持");
        }
    }

    private void validateRange(OffsetDateTime startAt, OffsetDateTime endAt) {
        if (startAt == null || endAt == null || !startAt.isBefore(endAt)) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "必须提供有效的startAt和endAt");
        }
        if (startAt.plusYears(5).isBefore(endAt)) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "单次统计范围不能超过5年");
        }
    }

    private LocalDateTime localDateTime(OffsetDateTime value) {
        return value.atZoneSameInstant(BUSINESS_ZONE).toLocalDateTime();
    }

    private Long number(Number value) {
        return value == null ? null : value.longValue();
    }

    private record ReportRow(
            String type,
            Long categoryId,
            String categoryName,
            BigDecimal amount,
            LocalDateTime occurredAt
    ) {
    }
}
