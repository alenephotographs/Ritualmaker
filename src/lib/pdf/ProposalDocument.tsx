import {
  Document,
  Image,
  Link,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { formatUsdFromCents } from "@/lib/clientDocumentMoney";
import type { ProposalPdfViewProps } from "@/lib/types/proposalBuilder";

const cream = "#F4F1EA";
const ink = "#2a2622";
const inkMuted = "#5c5650";
const rose = "#8b3550";
const cardBg = "#fffcf7";
const rule = "#e8e0d4";

const styles = StyleSheet.create({
  page: {
    backgroundColor: cream,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: ink,
    paddingTop: 48,
    paddingBottom: 52,
    paddingHorizontal: 48,
  },
  inner: {
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  lockup: { flexDirection: "row", alignItems: "center" },
  mark: { width: 32, height: 32, marginRight: 10 },
  brand: {
    fontFamily: "Times-Bold",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  docLabel: {
    fontSize: 8,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: inkMuted,
  },
  heroTitle: {
    fontFamily: "Times-Bold",
    fontSize: 26,
    lineHeight: 1.08,
    marginBottom: 18,
  },
  card: {
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: rule,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  cardRow: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: inkMuted,
    lineHeight: 1.45,
    marginBottom: 4,
  },
  cardStrong: { color: ink, fontFamily: "Times-Bold" },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: rose,
    marginLeft: 10,
    opacity: 0.35,
  },
  body: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.48,
    color: inkMuted,
  },
  scopeLine: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.42,
    marginBottom: 6,
    color: ink,
  },
  moneyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  moneyLabel: {
    fontFamily: "Helvetica",
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: inkMuted,
  },
  moneyValue: {
    fontFamily: "Times-Bold",
    fontSize: 16,
    color: ink,
  },
  moneyHero: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: ink,
    marginTop: 6,
    marginBottom: 4,
  },
  linkBtn: {
    marginTop: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
    backgroundColor: rose,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 3,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "none",
  },
  linkUrl: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: rose,
    marginBottom: 10,
  },
  staleNote: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#a65",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: rule,
    paddingTop: 10,
  },
  footerLine: {
    fontSize: 8.5,
    color: inkMuted,
    textAlign: "center",
    marginBottom: 2,
  },
});

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitLines(text: string): string[] {
  return text.split("\n");
}

function scopeLinesFromText(text: string): string[] {
  return splitLines(text);
}

export type ProposalDocumentProps = ProposalPdfViewProps & {
  markSrc: string;
  /** When true, omit payment URLs from the PDF (totals still reflect current proposal). */
  omitPaymentLinks?: boolean;
};

export function ProposalDocument({
  markSrc,
  omitPaymentLinks,
  ...view
}: ProposalDocumentProps) {
  const subtitleLines = view.packageSubtitle
    ? splitLines(view.packageSubtitle)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
  const notesParas = view.notes ? splitParagraphs(view.notes) : [];
  const dayParas = view.dayOf ? splitParagraphs(view.dayOf) : [];
  const scopeLines = scopeLinesFromText(view.scopeText ?? "");
  const totalC = view.totalCents ?? 0;
  const depC = view.depositCents ?? 0;
  const balC = view.balanceCents ?? 0;
  const showLinks =
    !omitPaymentLinks &&
    Boolean(view.depositLink?.trim() || view.balanceLink?.trim());
  const footer = view.footerLines?.length
    ? view.footerLines
    : ["Ritualmaker Flowers"];
  const nextSteps =
    view.nextStepsLines && view.nextStepsLines.length > 0
      ? view.nextStepsLines
      : [
          "Pay the deposit through your secure payment link to confirm your date.",
          "We will follow up with stem counts and palette details after deposit.",
        ];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.inner}>
          <View style={styles.headerRow} fixed>
            <View style={styles.lockup}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={markSrc} style={styles.mark} />
              <Text style={styles.brand}>Ritualmaker</Text>
            </View>
            <Text style={styles.docLabel}>Client proposal</Text>
          </View>

          <Text style={styles.heroTitle}>Event Floral Proposal</Text>

          <View style={styles.card} wrap={false}>
            {view.clientName?.trim() ? (
              <Text style={styles.cardRow}>
                <Text style={styles.cardStrong}>Client — </Text>
                {view.clientName.trim()}
              </Text>
            ) : null}
            {view.eventType?.trim() ? (
              <Text style={styles.cardRow}>
                <Text style={styles.cardStrong}>Event — </Text>
                {view.eventType.trim()}
              </Text>
            ) : null}
            {(view.eventDate || view.location) && (
              <Text style={styles.cardRow}>
                <Text style={styles.cardStrong}>When & where — </Text>
                {[view.eventDate, view.location].filter(Boolean).join(" · ")}
              </Text>
            )}
            {view.packageTitle?.trim() ? (
              <Text style={[styles.cardRow, { marginTop: 6 }]}>
                <Text style={styles.cardStrong}>Package — </Text>
                {view.packageTitle.trim()}
              </Text>
            ) : null}
          </View>

          {subtitleLines.length > 0 && (
            <View style={{ marginBottom: 16 }} wrap={false}>
              {subtitleLines.map((line, i) => (
                <Text key={`sub-${i}`} style={styles.body}>
                  {line}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.sectionHead} wrap={false}>
            <Text style={styles.sectionTitle}>Event details</Text>
            <View style={styles.sectionRule} />
          </View>
          <Text style={[styles.body, { marginBottom: 14 }]}>
            {view.clientName?.trim()
              ? `Prepared for ${view.clientName.trim()}.`
              : "Prepared for your celebration."}{" "}
            {view.eventDate?.trim()
              ? `Event date: ${view.eventDate.trim()}.`
              : ""}{" "}
            {view.location?.trim() ? `Location: ${view.location.trim()}.` : ""}
          </Text>

          {scopeLines.some((l) => l.trim().length > 0) && (
            <>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionTitle}>Floral scope</Text>
                <View style={styles.sectionRule} />
              </View>
              {scopeLines.map((line, i) => {
                const t = line.trim();
                if (!t) return <View key={`sp-${i}`} style={{ height: 4 }} />;
                return (
                  <Text key={`sc-${i}`} style={styles.scopeLine}>
                    {t}
                  </Text>
                );
              })}
            </>
          )}

          <View style={styles.sectionHead} wrap={false}>
            <Text style={styles.sectionTitle}>Payment schedule</Text>
            <View style={styles.sectionRule} />
          </View>
          <View style={[styles.card, { marginTop: 4 }]} wrap={false}>
            {totalC > 0 ? (
              <>
                <View style={styles.moneyRow}>
                  <Text style={styles.moneyLabel}>Proposal total</Text>
                  <Text style={styles.moneyHero}>
                    {formatUsdFromCents(totalC)}
                  </Text>
                </View>
                {depC > 0 ? (
                  <View style={styles.moneyRow}>
                    <Text style={styles.moneyLabel}>Deposit</Text>
                    <Text style={styles.moneyValue}>
                      {formatUsdFromCents(depC)}
                    </Text>
                  </View>
                ) : null}
                {balC > 0 ? (
                  <View style={styles.moneyRow}>
                    <Text style={styles.moneyLabel}>Balance</Text>
                    <Text style={styles.moneyValue}>
                      {formatUsdFromCents(balC)}
                    </Text>
                  </View>
                ) : null}
                {view.paymentDueDate?.trim() ? (
                  <Text style={[styles.body, { marginTop: 8 }]}>
                    Balance due: {view.paymentDueDate.trim()}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.body}>Totals will appear once finalized.</Text>
            )}
          </View>

          {showLinks ? (
            <>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionTitle}>Pay online</Text>
                <View style={styles.sectionRule} />
              </View>
              {view.depositLink?.trim() ? (
                <View wrap={false}>
                  {view.depositLine ? (
                    <Text style={[styles.body, { marginBottom: 4 }]}>
                      {view.depositLine}
                    </Text>
                  ) : null}
                  <Link src={view.depositLink.trim()}>
                    <Text style={styles.linkBtn}>Pay deposit</Text>
                  </Link>
                  <Link src={view.depositLink.trim()}>
                    <Text style={styles.linkUrl}>{view.depositLink.trim()}</Text>
                  </Link>
                </View>
              ) : null}
              {view.balanceLink?.trim() ? (
                <View wrap={false}>
                  {view.balanceLine ? (
                    <Text style={[styles.body, { marginBottom: 4 }]}>
                      {view.balanceLine}
                    </Text>
                  ) : null}
                  <Link src={view.balanceLink.trim()}>
                    <Text style={styles.linkBtn}>Pay balance</Text>
                  </Link>
                  <Link src={view.balanceLink.trim()}>
                    <Text style={styles.linkUrl}>{view.balanceLink.trim()}</Text>
                  </Link>
                </View>
              ) : null}
            </>
          ) : omitPaymentLinks ? (
            <Text style={styles.staleNote}>
              Payment links are being refreshed to match these totals. Use the
              links from your admin dashboard once regenerated.
            </Text>
          ) : null}

          <View style={styles.sectionHead} wrap={false}>
            <Text style={styles.sectionTitle}>Next steps</Text>
            <View style={styles.sectionRule} />
          </View>
          {nextSteps.map((line, i) => (
            <Text key={`ns-${i}`} style={[styles.body, { marginBottom: 6 }]}>
              {i + 1}. {line}
            </Text>
          ))}

          {view.bridesmaidNames?.trim() ? (
            <>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionTitle}>Ribbon names</Text>
                <View style={styles.sectionRule} />
              </View>
              <Text style={[styles.body, { marginBottom: 12 }]}>
                {view.bridesmaidNames.trim()}
              </Text>
            </>
          ) : null}

          {notesParas.length > 0 && (
            <>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.sectionRule} />
              </View>
              {notesParas.map((para, i) => (
                <Text key={`n-${i}`} style={[styles.body, { marginBottom: 8 }]}>
                  {para
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .join("\n")}
                </Text>
              ))}
            </>
          )}

          {dayParas.length > 0 && (
            <>
              <View style={styles.sectionHead} wrap={false}>
                <Text style={styles.sectionTitle}>Day-of</Text>
                <View style={styles.sectionRule} />
              </View>
              {dayParas.map((para, i) => (
                <Text key={`d-${i}`} style={[styles.body, { marginBottom: 8 }]}>
                  {para
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .join("\n")}
                </Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.footer} fixed>
          {footer.map((line, i) => (
            <Text key={`f-${i}`} style={styles.footerLine}>
              {line}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
