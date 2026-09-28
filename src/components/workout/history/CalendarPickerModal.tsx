import { colors } from "@/styles/global";
import { getTodayDateString, isToday, parseLocalDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CalendarPickerModalProps = {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CalendarPickerContent({
  selectedDate,
  onSelectDate,
  onClose,
}: {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}) {
  const parsed = useMemo(() => parseLocalDate(selectedDate), [selectedDate]);
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  const handlePrevMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.selectionAsync();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const handlePickDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    onSelectDate(`${viewYear}-${mStr}-${dStr}`);
    onClose();
  };

  return (
    <View style={styles.modalCard}>
      {/* Month / Year Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((wd, i) => (
          <Text key={i} style={styles.weekdayText}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {Array.from({ length: firstDayWeekday }).map((_, idx) => (
          <View key={`empty-${idx}`} style={styles.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, idx) => idx + 1).map(
          (day) => {
            const mStr = String(viewMonth + 1).padStart(2, "0");
            const dStr = String(day).padStart(2, "0");
            const dateStr = `${viewYear}-${mStr}-${dStr}`;
            const isSelected = dateStr === selectedDate;
            const isCurrentDay = isToday(dateStr);

            return (
              <TouchableOpacity
                key={`day-${day}`}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  isCurrentDay && !isSelected && styles.todayCell,
                ]}
                onPress={() => handlePickDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isCurrentDay && !isSelected && styles.todayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => {
            onSelectDate(getTodayDateString());
            onClose();
          }}
        >
          <Text style={styles.todayActionText}>Jump to Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarPickerModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <CalendarPickerContent
          key={selectedDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  weekdayText: {
    width: 36,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedDayText: {
    color: "#0A0A0A",
    fontWeight: "700",
  },
  todayText: {
    color: colors.primary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  footerBtn: {
    paddingVertical: 6,
  },
  todayActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  closeBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
