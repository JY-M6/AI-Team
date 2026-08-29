package com.qianji.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class ReportResponses {

    private ReportResponses() {
    }

    public record Summary(
            BigDecimal income,
            BigDecimal expense,
            BigDecimal balance,
            long transactionCount
    ) {
    }

    public record TrendPoint(
            String bucket,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal balance,
            long transactionCount
    ) {
    }

    public record CategoryItem(
            String categoryId,
            String categoryName,
            BigDecimal amount,
            BigDecimal percentage,
            long transactionCount
    ) {
    }

    public record CalendarDay(
            LocalDate date,
            BigDecimal income,
            BigDecimal expense,
            long transactionCount
    ) {
    }

    public record MonthlyCalendar(
            String month,
            BigDecimal income,
            BigDecimal expense,
            List<CalendarDay> days
    ) {
    }
}
