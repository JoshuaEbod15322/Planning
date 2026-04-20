import { format, parseISO, isValid } from "date-fns";
import { Assignment, Fee, EventData } from "../types";
import { Download, FileText, Printer } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
} from "docx";

interface EventDocumentProps {
  data: EventData;
  totalFee: number;
}

export default function EventDocument({ data, totalFee }: EventDocumentProps) {
  const themeStyles = {
    modern: {
      wrapper: "bg-white font-sans",
      headerText: "text-slate-900 tracking-tighter",
      accentText: "text-indigo-600",
      accentBg: "bg-slate-900",
      sectionHeading: "text-slate-300 border-slate-100",
      card: "bg-slate-50 rounded-3xl",
      titleLine: "bg-slate-900",
      borderColor: "border-slate-900",
      font: "Inter",
      headingSize: 72,
    },
    classic: {
      wrapper: "bg-[#fdfbf7] font-serif",
      headerText: "font-serif text-slate-800 tracking-normal",
      accentText: "text-amber-800 italic",
      accentBg: "bg-amber-800",
      sectionHeading: "text-amber-900/30 border-amber-900/10 italic",
      card: "bg-white border border-amber-900/10 rounded-none shadow-none p-10",
      titleLine: "bg-amber-800",
      borderColor: "border-amber-800",
      font: "Playfair Display",
      headingSize: 64,
    },
    brutalist: {
      wrapper: "bg-white font-display uppercase",
      headerText: "text-black tracking-tighter",
      accentText: "text-black underline decoration-4 underline-offset-8",
      accentBg: "bg-black",
      sectionHeading: "text-black border-black border-b-4",
      card: "bg-white border-4 border-black rounded-none",
      titleLine: "bg-black",
      borderColor: "border-black",
      font: "Space Grotesk",
      headingSize: 80,
    },
    luxury: {
      wrapper: "bg-[#f5f2ed] font-luxury",
      headerText: "text-slate-800 font-light tracking-[0.1em]",
      accentText: "text-rose-800/80",
      accentBg: "bg-rose-900/20",
      sectionHeading: "text-rose-900/20 border-rose-900/10 tracking-[0.3em]",
      card: "bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white",
      titleLine: "bg-rose-800/30",
      borderColor: "border-rose-800/30",
      font: "Cormorant Garamond",
      headingSize: 60,
    },
    technical: {
      wrapper: "bg-slate-50 font-mono",
      headerText: "text-slate-900 tracking-tight",
      accentText: "text-sky-600",
      accentBg: "bg-sky-600",
      sectionHeading: "text-sky-900/20 border-sky-200 dashed",
      card: "bg-white border border-slate-200 rounded-none border-dashed",
      titleLine: "bg-sky-600",
      borderColor: "border-sky-600",
      font: "JetBrains Mono",
      headingSize: 56,
    },
  }[data.theme || "modern"];

  const formatDate = (dateStr: string) => {
    if (!dateStr || !isValid(parseISO(dateStr))) return "Not set";
    return format(parseISO(dateStr), "PPPP");
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // new Paragraph({
            //   text: "GATHER PLANNER OFFICIAL",
            //   heading: HeadingLevel.HEADING_4,
            // }),
            new Paragraph({
              children: [
                new TextRun({
                  text: data.title || "Untitled Project",
                  bold: true,
                  size: themeStyles.headingSize,
                  font: themeStyles.font,
                }),
              ],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Schedule: ",
                  bold: true,
                  font: themeStyles.font,
                }),
                new TextRun({
                  text: `${formatDate(data.when)}${data.time ? ` at ${data.time}` : ""}`,
                  font: themeStyles.font,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Location: ",
                  bold: true,
                  font: themeStyles.font,
                }),
                new TextRun({
                  text: data.where || "Not specified",
                  font: themeStyles.font,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...(data.notes
              ? [
                  new Paragraph({
                    text: "ADDITIONAL DETAILS",
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: data.notes, font: themeStyles.font }),
                    ],
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            new Paragraph({
              text: "ROSTER & TASKS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Item",
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Assigned To",
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                ...data.assignments.map(
                  (a) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: a.item || "---",
                                  font: themeStyles.font,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: a.person || "---",
                                  font: themeStyles.font,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                ),
              ],
            }),

            new Paragraph({
              text: "FINANCIAL SUMMARY",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Detail",
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Amount",
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                ...data.fees.map(
                  (f) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: f.detail || "---",
                                  font: themeStyles.font,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `$${f.amount.toLocaleString()}`,
                                  font: themeStyles.font,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                ),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "TOTAL",
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `$${totalFee.toLocaleString()}`,
                              bold: true,
                              font: themeStyles.font,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Document generated on ${new Date().toLocaleDateString()}`,
                  font: themeStyles.font,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 800 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = data.title
      ? `${data.title.toLowerCase().replace(/\s+/g, "-")}-plan.docx`
      : "event-plan.docx";
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div
      className={`${themeStyles.wrapper} min-h-screen p-8 md:p-16 max-w-4xl mx-auto shadow-2xl relative overflow-hidden group/doc transition-colors duration-500 print:shadow-none print:p-0 print:max-w-none print:min-h-0`}
    >
      {/* Interactive Controls Overlay */}
      <div className="absolute top-6 right-6 flex gap-3 no-print z-10 opacity-0 group-hover/doc:opacity-100 transition-opacity">
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
        >
          <Download size={14} />
          Save PDF
        </button>
      </div>

      <header className="mb-12">
        <h1
          className={`text-5xl font-black leading-none mb-4 break-words ${themeStyles.headerText}`}
        >
          {data.title || "Untitled Project"}
        </h1>
        <div className={`h-1.5 w-24 rounded-full ${themeStyles.titleLine}`} />
      </header>

      <section
        className={`grid grid-cols-2 gap-12 mb-12 p-8 ${themeStyles.card}`}
      >
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Scheduled Event
          </h4>
          <p className={`text-xl font-bold ${themeStyles.headerText}`}>
            {formatDate(data.when)}
            {data.time && (
              <span className="text-slate-400 font-medium ml-2 text-sm">
                @ {data.time}
              </span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Host Location
          </h4>
          <p className={`text-xl font-bold ${themeStyles.headerText}`}>
            {data.where || "TBD"}
          </p>
        </div>
      </section>

      {data.notes && (
        <section className="mb-16">
          <h2
            className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b pb-4 ${themeStyles.sectionHeading}`}
          >
            ADDITIONAL CONTEXT
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {data.notes}
          </p>
        </section>
      )}

      <section className="mb-16 break-inside-avoid">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2
            className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeStyles.sectionHeading}`}
          >
            ROSTER & TASKS
          </h2>
          <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-400">
            {data.assignments.length} ITEMS
          </span>
        </div>
        {data.assignments.length > 0 ? (
          <div className="space-y-4">
            {data.assignments.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center border-b border-slate-50/50 pb-4 last:border-0 group/item"
              >
                <span className="text-lg font-medium text-slate-600 transition-colors group-hover/item:text-slate-900">
                  {a.item || "Generic Item"}
                </span>
                <span
                  className={`text-lg font-black ${themeStyles.headerText}`}
                >
                  {a.person || "Unassigned"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-300 italic text-sm">
            No tasks assigned yet.
          </p>
        )}
      </section>

      <section className="mb-16 break-inside-avoid">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2
            className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeStyles.sectionHeading}`}
          >
            FINANCIAL SUMMARY
          </h2>
          <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-400">
            {data.fees.length} ENTRIES
          </span>
        </div>
        {data.fees.length > 0 ? (
          <div className="space-y-4">
            {data.fees.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center text-slate-600 border-b border-slate-50/30 pb-4 last:border-0"
              >
                <span className="text-lg font-medium">
                  {f.detail || "Generic Cost"}
                </span>
                <span
                  className={`font-mono font-bold text-lg ${themeStyles.headerText}`}
                >
                  ${f.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <div
              className={`pt-10 flex justify-between items-end border-t-4 mt-12 ${themeStyles.borderColor}`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Consolidated Total
                </span>
                <p className="text-[10px] text-slate-300 font-medium">
                  Inclusive of all logged expenditures
                </p>
              </div>
              <span
                className={`text-6xl font-black tracking-tighter ${themeStyles.accentText}`}
              >
                ${totalFee.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 italic text-sm">
            No expenses logged yet.
          </p>
        )}
      </section>
    </div>
  );
}
