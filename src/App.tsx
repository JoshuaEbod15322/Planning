import { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import "react-day-picker/dist/style.css";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Printer,
  FileText,
  TrendingDown,
  Layout,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Palette,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EventData, Assignment, Fee } from "./types";
import EventDocument from "./components/EventDocument";

const STORAGE_KEY = "gather_planner_data_v3";

export default function App() {
  const [data, setData] = useState<EventData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn("Failed to parse saved data, using defaults:", error);
    }
    return {
      title: "",
      when: "",
      time: "",
      where: "",
      notes: "",
      theme: "modern",
      assignments: [],
      fees: [],
    };
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const totalFee = useMemo(() => {
    return data.fees.reduce((acc, current) => acc + current.amount, 0);
  }, [data.fees]);

  const updateField = (field: keyof EventData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addAssignment = () => {
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      item: "",
      person: "",
    };
    setData((prev) => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment],
    }));
  };

  const removeAssignment = (id: string) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  };

  const updateAssignment = (
    id: string,
    field: keyof Assignment,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === id ? { ...a, [field]: value } : a,
      ),
    }));
  };

  const addFee = () => {
    const newFee: Fee = {
      id: crypto.randomUUID(),
      detail: "",
      amount: 0,
    };
    setData((prev) => ({
      ...prev,
      fees: [...prev.fees, newFee],
    }));
  };

  const removeFee = (id: string) => {
    setData((prev) => ({
      ...prev,
      fees: prev.fees.filter((f) => f.id !== id),
    }));
  };

  const updateFee = (id: string, field: keyof Fee, value: string | number) => {
    setData((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for date formatting in preview
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {!isPreviewOpen ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pb-32"
          >
            {/* Navigation Rail / Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 no-print">
              <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"
                  >
                    <Layout size={20} />
                  </motion.div> */}
                  {/* <div className="flex flex-col -space-y-0.5">
                    <span className="font-bold text-slate-900 tracking-tight">
                      Gather
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Planner Pro
                    </span>
                  </div> */}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                  >
                    <FileText size={18} className="opacity-60" />
                    Preview Document
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95"
                  >
                    <Printer size={18} />
                    Print Docs
                  </button>
                </div>
              </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 mt-12 no-print">
              <div className="space-y-16">
                {/* Header & Core Info */}
                <section className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Enter Event Title"
                      className="text-6xl font-black bg-transparent outline-none w-full border-none focus:ring-0 placeholder:text-slate-200 py-2 tracking-tighter"
                    />
                    <div className="h-1.5 w-24 bg-indigo-600 rounded-full mt-2" />
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="space-y-3 group relative">
                      <label className="input-label">
                        <CalendarIcon size={12} className="text-indigo-500" />
                        Scheduled Date
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 shadow-sm transition-all text-left flex justify-between items-center"
                        >
                          <span className="truncate">
                            {data.when && isValid(parseISO(data.when))
                              ? format(parseISO(data.when), "PPP")
                              : "Pick a date"}
                          </span>
                          <CalendarIcon
                            size={20}
                            className="text-slate-300 group-hover:text-indigo-300 transition-colors flex-shrink-0"
                          />
                        </button>

                        <AnimatePresence>
                          {isCalendarOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsCalendarOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-3 p-4 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 min-w-[320px]"
                              >
                                <DayPicker
                                  mode="single"
                                  selected={
                                    data.when && isValid(parseISO(data.when))
                                      ? parseISO(data.when)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      updateField(
                                        "when",
                                        format(date, "yyyy-MM-dd"),
                                      );
                                      setIsCalendarOpen(false);
                                    }
                                  }}
                                />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-3 group relative">
                      <label className="input-label">
                        <Clock size={12} className="text-sky-500" />
                        Event Time
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-700 focus:border-sky-400 focus:ring-4 focus:ring-sky-50/50 shadow-sm transition-all text-left flex justify-between items-center"
                        >
                          <span>{data.time || "Pick a time"}</span>
                          <Clock
                            size={20}
                            className="text-slate-300 group-hover:text-sky-300 transition-colors"
                          />
                        </button>

                        <AnimatePresence>
                          {isTimePickerOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsTimePickerOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-3 p-6 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 min-w-[280px]"
                              >
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                      Popular Times
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        "09:00 AM",
                                        "12:00 PM",
                                        "06:00 PM",
                                        "07:30 PM",
                                        "08:00 PM",
                                        "10:00 PM",
                                      ].map((t) => (
                                        <button
                                          key={t}
                                          onClick={() => {
                                            updateField("time", t);
                                            setIsTimePickerOpen(false);
                                          }}
                                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                            data.time === t
                                              ? "bg-sky-600 text-white"
                                              : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                                          }`}
                                        >
                                          {t}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-4 border-t border-slate-100 italic text-[10px] text-slate-400 text-center">
                                    Click a preset to select
                                  </div>

                                  <div className="flex flex-col gap-2 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                      Custom Entry
                                    </label>
                                    <input
                                      type="text"
                                      value={data.time || ""}
                                      onChange={(e) =>
                                        updateField("time", e.target.value)
                                      }
                                      placeholder="Type custom time..."
                                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold placeholder:font-medium placeholder:text-slate-300 focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-50 transition-all outline-none"
                                    />
                                    <button
                                      onClick={() => setIsTimePickerOpen(false)}
                                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95 mt-2"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="input-label">
                        <MapPin size={12} className="text-rose-500" />
                        Event Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={data.where}
                          onChange={(e) => updateField("where", e.target.value)}
                          placeholder="Where is the magic happening?"
                          className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-50/50 shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section - Optional */}
                  <div className="mt-10 space-y-3 group">
                    <label className="input-label">
                      <FileText size={12} className="text-amber-500" />
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={data.notes || ""}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Any extra details, special requests, or reminders..."
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-medium text-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-50/50 shadow-sm transition-all min-h-[120px] resize-none"
                    />
                  </div>
                </section>

                {/* Assignments */}
                <section className="space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Assignments
                      </h2>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1 font-medium">
                        <Users size={16} />
                        <span>
                          {data.assignments.length} items to coordinate
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={addAssignment}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {data.assignments.map((assignment, index) => (
                        <motion.div
                          key={assignment.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="card-premium flex items-center p-4 gap-4"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-100">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="flex-1 grid grid-cols-2 gap-8">
                            <input
                              type="text"
                              value={assignment.item}
                              onChange={(e) =>
                                updateAssignment(
                                  assignment.id,
                                  "item",
                                  e.target.value,
                                )
                              }
                              placeholder="Task or item name"
                              className="bg-transparent font-medium border-none focus:ring-0 placeholder:text-slate-200"
                            />
                            <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                              <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded">
                                Assignee
                              </span>
                              <input
                                type="text"
                                value={assignment.person}
                                onChange={(e) =>
                                  updateAssignment(
                                    assignment.id,
                                    "person",
                                    e.target.value,
                                  )
                                }
                                placeholder="Name"
                                className="w-full bg-transparent font-bold text-slate-800 border-none focus:ring-0 placeholder:text-slate-200"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => removeAssignment(assignment.id)}
                            className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {data.assignments.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3"
                      >
                        <Users size={40} strokeWidth={1} />
                        <p className="font-medium">
                          No assignments mapped out yet
                        </p>
                      </motion.div>
                    )}
                  </div>
                </section>

                {/* Fees */}
                <section className="space-y-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Expenses
                      </h2>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1 font-medium">
                        <DollarSign size={16} />
                        <span>Budget control tracker</span>
                      </div>
                    </div>
                    <button
                      onClick={addFee}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95"
                    >
                      <Plus size={18} />
                      Log Cost
                    </button>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {data.fees.map((fee) => (
                        <motion.div
                          key={fee.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="card-premium flex items-center p-4 gap-4"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={fee.detail}
                              onChange={(e) =>
                                updateFee(fee.id, "detail", e.target.value)
                              }
                              placeholder="Cost detail (e.g. Booking Fee)"
                              className="w-full bg-transparent font-medium border-none focus:ring-0 placeholder:text-slate-200"
                            />
                          </div>
                          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                            <span className="text-slate-400 font-bold mr-1">
                              $
                            </span>
                            <input
                              type="number"
                              value={fee.amount}
                              onChange={(e) =>
                                updateFee(
                                  fee.id,
                                  "amount",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-24 bg-transparent font-mono font-bold text-right text-slate-700 outline-none"
                            />
                          </div>
                          <button
                            onClick={() => removeFee(fee.id)}
                            className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {data.fees.length > 0 ? (
                      <motion.div
                        layout
                        className="bg-indigo-600 p-8 rounded-3xl flex justify-between items-center text-white shadow-2xl shadow-indigo-200 overflow-hidden relative"
                      >
                        <div className="absolute right-0 top-0 opacity-10 -mr-16 -mt-16 pointer-events-none">
                          <TrendingDown size={300} />
                        </div>
                        <div className="relative z-10">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                            Total Estimated Spend
                          </span>
                          <h3 className="text-5xl font-black mt-1 leading-none tracking-tighter">
                            <span className="text-2xl mr-1 opacity-50">$</span>
                            {totalFee.toLocaleString()}
                          </h3>
                        </div>
                        <div className="relative z-10 p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                          <CheckCircle2 size={32} />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3"
                      >
                        <DollarSign size={40} strokeWidth={1} />
                        <p className="font-medium">No expenses logged yet</p>
                      </motion.div>
                    )}
                  </div>
                </section>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="min-h-screen bg-slate-200 py-12 px-4 md:px-8 no-print"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm shadow-sm transition-all hover:-translate-x-1 active:translate-x-0"
                >
                  <ArrowLeft size={18} />
                  Back to Editor
                </button>

                <div className="flex items-center gap-2 bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Document Shield Active
                  </span>
                </div>
              </div>

              {/* Theme Section - Now in Preview Mode */}
              <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-900 text-white rounded-lg">
                    <Palette size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">
                      Select Theme
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(
                    [
                      {
                        id: "modern",
                        label: "Modern",
                        icon: Layout,
                        activeClass: "ring-indigo-500 ring-2 bg-indigo-50",
                        iconClass: "text-indigo-600",
                        textClass: "text-indigo-600",
                      },
                      {
                        id: "classic",
                        label: "Classic",
                        icon: FileText,
                        activeClass: "ring-amber-500 ring-2 bg-amber-50",
                        iconClass: "text-amber-600",
                        textClass: "text-amber-600",
                      },
                      {
                        id: "brutalist",
                        label: "Brutalist",
                        icon: CheckCircle2,
                        activeClass:
                          "ring-zinc-800 ring-2 bg-zinc-800 text-white",
                        iconClass: "text-zinc-400",
                        textClass: "text-white",
                      },
                      {
                        id: "luxury",
                        label: "Luxury",
                        icon: Sparkles,
                        activeClass: "ring-rose-500 ring-2 bg-rose-50",
                        iconClass: "text-rose-600",
                        textClass: "text-rose-600",
                      },
                      {
                        id: "technical",
                        label: "Technical",
                        icon: Clock,
                        activeClass: "ring-sky-500 ring-2 bg-sky-50",
                        iconClass: "text-sky-600",
                        textClass: "text-sky-600",
                      },
                    ] as const
                  ).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateField("theme", theme.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                        data.theme === theme.id
                          ? theme.activeClass
                          : "bg-white/80 border border-transparent hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      <theme.icon
                        size={14}
                        className={
                          data.theme === theme.id
                            ? theme.iconClass
                            : "text-slate-400"
                        }
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          data.theme === theme.id
                            ? theme.textClass
                            : "text-slate-500"
                        }`}
                      >
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <EventDocument data={data} totalFee={totalFee} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Print Target */}
      <div className="print-only">
        <EventDocument data={data} totalFee={totalFee} />
      </div>
    </div>
  );
}
