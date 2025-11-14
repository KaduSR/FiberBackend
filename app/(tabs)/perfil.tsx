import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Invoice {
  id: number;
  month: string;
  amount: number;
  dueDate: string;
  status: "pago" | "pendente" | "vencido";
  paidDate?: string;
}

export default function PerfilScreen() {
  const so = Platform;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: "", message: "" });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web") {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      const { Alert } = require("react-native");
      Alert.alert(
        title,
        message,
        onOk ? [{ text: "OK", onPress: onOk }] : undefined
      );
    }
  };

  const user = {
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    plan: "Fiber Game 500MB",
    address: "Rua das Flores, 123 - São Paulo, SP",
    customerSince: "Janeiro 2024",
  };

  const invoices: Invoice[] = [
    {
      id: 1,
      month: "Novembro 2025",
      amount: 129.9,
      dueDate: "10/11/2025",
      status: "pendente",
    },
    {
      id: 2,
      month: "Outubro 2025",
      amount: 129.9,
      dueDate: "10/10/2025",
      status: "pago",
      paidDate: "09/10/2025",
    },
    {
      id: 3,
      month: "Setembro 2025",
      amount: 129.9,
      dueDate: "10/09/2025",
      status: "pago",
      paidDate: "10/09/2025",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return theme.colors.success;
      case "pendente":
        return theme.colors.warning;
      case "vencido":
        return theme.colors.error;
      default:
        return theme.colors.text.secondary.light;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago";
      case "pendente":
        return "Pendente";
      case "vencido":
        return "Vencido";
      default:
        return status;
    }
  };

  const handleDownloadInvoice = (month: string) => {
    showWebAlert("Download Iniciado", `Baixando fatura de ${month}...`);
  };

  const handlePayWithPix = (month: string) => {
    showWebAlert(
      "Pagamento Pix",
      `Gerando código Pix para fatura de ${month}...`
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.background.dark
            : theme.colors.background.light,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[
            theme.colors.gradient.primary[0],
            theme.colors.gradient.primary[1],
          ]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={48}
                color={theme.colors.text.inverse}
              />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons
                name="camera"
                size={20}
                color={theme.colors.text.inverse}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPlan}>{user.plan}</Text>
          <Text style={styles.customerSince}>
            Cliente desde {user.customerSince}
          </Text>
        </LinearGradient>

        {/* User Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark
                ? theme.colors.card.dark
                : theme.colors.card.light,
              ...theme.shadows.md,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: isDark
                      ? theme.colors.text.primary.dark
                      : theme.colors.text.primary.light,
                  },
                ]}
              >
                Informações Pessoais
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons
                name="mail"
                size={20}
                color={
                  isDark
                    ? theme.colors.text.secondary.dark
                    : theme.colors.text.secondary.light
                }
              />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.text.secondary.dark
                        : theme.colors.text.secondary.light,
                    },
                  ]}
                >
                  Email
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.colors.text.primary.dark
                        : theme.colors.text.primary.light,
                    },
                  ]}
                >
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="call"
                size={20}
                color={
                  isDark
                    ? theme.colors.text.secondary.dark
                    : theme.colors.text.secondary.light
                }
              />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.text.secondary.dark
                        : theme.colors.text.secondary.light,
                    },
                  ]}
                >
                  Telefone
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.colors.text.primary.dark
                        : theme.colors.text.primary.light,
                    },
                  ]}
                >
                  {user.phone}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="location"
                size={20}
                color={
                  isDark
                    ? theme.colors.text.secondary.dark
                    : theme.colors.text.secondary.light
                }
              />
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme.colors.text.secondary.dark
                        : theme.colors.text.secondary.light,
                    },
                  ]}
                >
                  Endereço
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isDark
                        ? theme.colors.text.primary.dark
                        : theme.colors.text.primary.light,
                    },
                  ]}
                >
                  {user.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invoices Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme.colors.text.primary.dark
                  : theme.colors.text.primary.light,
              },
            ]}
          >
            Faturas
          </Text>

          {invoices.map((invoice) => (
            <View
              key={invoice.id}
              style={[
                styles.card,
                styles.invoiceCard,
                {
                  backgroundColor: isDark
                    ? theme.colors.card.dark
                    : theme.colors.card.light,
                  ...theme.shadows.sm,
                },
              ]}
            >
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text
                    style={[
                      styles.invoiceMonth,
                      {
                        color: isDark
                          ? theme.colors.text.primary.dark
                          : theme.colors.text.primary.light,
                      },
                    ]}
                  >
                    {invoice.month}
                  </Text>
                  <Text
                    style={[
                      styles.invoiceAmount,
                      { color: theme.colors.primary },
                    ]}
                  >
                    R$ {invoice.amount.toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(invoice.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(invoice.status) },
                    ]}
                  >
                    {getStatusText(invoice.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.invoiceDetails}>
                <View style={styles.invoiceDetailItem}>
                  <Ionicons
                    name="calendar"
                    size={14}
                    color={
                      isDark
                        ? theme.colors.text.secondary.dark
                        : theme.colors.text.secondary.light
                    }
                  />
                  <Text
                    style={[
                      styles.invoiceDetailText,
                      {
                        color: isDark
                          ? theme.colors.text.secondary.dark
                          : theme.colors.text.secondary.light,
                      },
                    ]}
                  >
                    Vencimento: {invoice.dueDate}
                  </Text>
                </View>
                {invoice.paidDate && (
                  <View style={styles.invoiceDetailItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={theme.colors.success}
                    />
                    <Text
                      style={[
                        styles.invoiceDetailText,
                        { color: theme.colors.success },
                      ]}
                    >
                      Pago em: {invoice.paidDate}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.invoiceActions}>
                <TouchableOpacity
                  style={[
                    styles.invoiceButton,
                    {
                      backgroundColor: isDark
                        ? theme.colors.surface.dark
                        : theme.colors.surface.light,
                    },
                  ]}
                  onPress={() => handleDownloadInvoice(invoice.month)}
                >
                  <Ionicons
                    name="download"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.invoiceButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Baixar PDF
                  </Text>
                </TouchableOpacity>

                {invoice.status === "pendente" && (
                  <TouchableOpacity
                    style={styles.pixButton}
                    onPress={() => handlePayWithPix(invoice.month)}
                  >
                    <LinearGradient
                      colors={theme.colors.gradient.primary}
                      style={styles.pixButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons
                        name="qr-code"
                        size={18}
                        color={theme.colors.text.inverse}
                      />
                      <Text style={styles.pixButtonText}>Pagar com Pix</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme.colors.text.primary.dark
                  : theme.colors.text.primary.light,
              },
            ]}
          >
            Configurações
          </Text>

          {[
            {
              icon: "notifications",
              label: "Notificações",
              color: theme.colors.warning,
            },
            {
              icon: "shield-checkmark",
              label: "Privacidade e Segurança",
              color: theme.colors.success,
            },
            {
              icon: "help-circle",
              label: "Ajuda e Suporte",
              color: theme.colors.info,
            },
            {
              icon: "document-text",
              label: "Termos de Uso",
              color: theme.colors.text.secondary.light,
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                styles.settingsItem,
                {
                  backgroundColor: isDark
                    ? theme.colors.card.dark
                    : theme.colors.card.light,
                  ...theme.shadows.sm,
                },
              ]}
            >
              <View style={styles.settingsContent}>
                <View
                  style={[
                    styles.settingsIcon,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <Text
                  style={[
                    styles.settingsLabel,
                    {
                      color: isDark
                        ? theme.colors.text.primary.dark
                        : theme.colors.text.primary.light,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  isDark
                    ? theme.colors.text.secondary.dark
                    : theme.colors.text.secondary.light
                }
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.card, styles.logoutButton, theme.shadows.sm]}
          >
            <Ionicons name="log-out" size={24} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === "web" && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark
                    ? theme.colors.card.dark
                    : theme.colors.card.light,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isDark
                      ? theme.colors.text.primary.dark
                      : theme.colors.text.primary.light,
                  },
                ]}
              >
                {alertConfig.title}
              </Text>
              <Text
                style={[
                  styles.modalMessage,
                  {
                    color: isDark
                      ? theme.colors.text.secondary.dark
                      : theme.colors.text.secondary.light,
                  },
                ]}
              >
                {alertConfig.message}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig((prev) => ({ ...prev, visible: false }));
                }}
              >
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: theme.colors.text.inverse,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: theme.colors.text.inverse,
    fontSize: 24,
    fontWeight: "700",
  },
  userPlan: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    opacity: 0.9,
  },
  customerSince: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    opacity: 0.8,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  infoList: {
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  invoiceCard: {
    marginBottom: theme.spacing.sm,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  invoiceInfo: {
    gap: 4,
  },
  invoiceMonth: {
    fontSize: 16,
    fontWeight: "600",
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  invoiceDetails: {
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  invoiceDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  invoiceDetailText: {
    fontSize: 12,
  },
  invoiceActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  invoiceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  invoiceButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pixButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  pixButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  pixButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  settingsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  settingsIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    backgroundColor: `${theme.colors.error}10`,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    minWidth: 280,
    maxWidth: 340,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    marginTop: theme.spacing.sm,
  },
  modalButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },
});
