"use client";

import { useEffect, useState } from "react";
import { Sliders, Save, Database, Sparkles, Check, AlertCircle, FileSpreadsheet, ListTodo, RefreshCw } from "lucide-react";
import Link from "next/link";

interface PreviewConfig {
  activeTab: string;
  crmTotalRevenue: number;
  crmClientCount: number;
  crmContactsJson: string;
  invUnpaidCount: number;
  invTotalUnpaid: number;
  invInvoicesJson: string;
  tasksJson: string;
  aiInputText: string;
  aiOutputText: string;
}

export default function AdminDashboardPreview() {
  const [config, setConfig] = useState<PreviewConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // JSON Validation States
  const [crmJsonError, setCrmJsonError] = useState<string | null>(null);
  const [invJsonError, setInvJsonError] = useState<string | null>(null);
  const [tasksJsonError, setTasksJsonError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/dashboard-preview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      } else {
        console.error("Failed to load preview config");
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PreviewConfig, value: string | number) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value,
    });

    // Reset error states on modify
    if (field === "crmContactsJson") setCrmJsonError(null);
    if (field === "invInvoicesJson") setInvJsonError(null);
    if (field === "tasksJson") setTasksJsonError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    // Validate JSON contents before pushing
    let hasError = false;
    try {
      JSON.parse(config.crmContactsJson);
    } catch (e) {
      setCrmJsonError("Invalid JSON array structure (e.g. key-values, missing brackets)");
      hasError = true;
    }

    try {
      JSON.parse(config.invInvoicesJson);
    } catch (e) {
      setInvJsonError("Invalid JSON array structure (e.g. key-values, missing brackets)");
      hasError = true;
    }

    try {
      JSON.parse(config.tasksJson);
    } catch (e) {
      setTasksJsonError("Invalid JSON array structure (e.g. key-values, missing brackets)");
      hasError = true;
    }

    if (hasError) {
      setStatusMessage({ type: "error", text: "JSON validation failed. Please check for syntax errors." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/dashboard-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({ type: "success", text: "Dashboard preview configuration successfully updated!" });
        setConfig(data.config);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update configuration." });
      }
    } catch (error) {
      console.error("Error saving config:", error);
      setStatusMessage({ type: "error", text: "A connection error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset this mockup back to the default values?")) return;
    
    const defaultData = {
      activeTab: "crm",
      crmTotalRevenue: 12450.00,
      crmClientCount: 8,
      crmContactsJson: JSON.stringify([
        { name: "Alex Mercer", email: "alex@designco.uk", stage: "Lead", value: 4500.00 },
        { name: "Sarah Jenkins", email: "sarah@jenkinslegal.co.uk", stage: "Customer", value: 3200.00 },
        { name: "David Cole", email: "david@colebuilders.uk", stage: "Contact", value: 1500.00 }
      ], null, 2),
      invUnpaidCount: 3,
      invTotalUnpaid: 1850.00,
      invInvoicesJson: JSON.stringify([
        { number: "INV-2026-001", client: "Acme Corp Ltd", amount: 950.00, status: "Pending" },
        { number: "INV-2026-002", client: "Sarah Jenkins", amount: 650.00, status: "Overdue" },
        { number: "INV-2026-003", client: "David Cole", amount: 250.00, status: "Pending" }
      ], null, 2),
      tasksJson: JSON.stringify([
        { id: "1", title: "Review UK VAT returns", status: "TODO", priority: "HIGH" },
        { id: "2", title: "Follow up with Alex Mercer", status: "IN_PROGRESS", priority: "MEDIUM" },
        { id: "3", title: "Submit corporation tax draft", status: "TODO", priority: "HIGH" }
      ], null, 2),
      aiInputText: "Spent 45 mins with John. He wants to order 12 more units by Friday. Send invoice ASAP.",
      aiOutputText: "• Client: John\n• Action Item: Order 12 units by Friday\n• Task: Generate and send invoice."
    };

    setConfig(defaultData);
    setStatusMessage({ type: "success", text: "Mockup reset to defaults in editor. Press Save to publish changes." });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Fetching preview configuration...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-200 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold">Error loading database configuration</p>
          <p className="text-sm">Verify that your Postgres database contains the required table structure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-6 h-6 text-orange-500" />
            <h1 className="text-3xl font-bold">Landing Page Mockup CRUD</h1>
          </div>
          <p className="text-slate-300">Customize metrics, task pipelines, invoice values, and dynamic AI summaries shown on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Defaults
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-all text-sm font-semibold"
          >
            View Live Page →
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          statusMessage.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {statusMessage.type === "success" ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="font-semibold text-sm">{statusMessage.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Core Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">General Display Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Default Active Showcase Tab</label>
              <select
                value={config.activeTab}
                onChange={(e) => handleInputChange("activeTab", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="crm">CRM Pipeline</option>
                <option value="invoices">Invoices & VAT</option>
                <option value="tasks">Task Tracker</option>
                <option value="ai">AI Engine Synthesis</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Specifies which module will load first on page load.</p>
            </div>
          </div>
        </div>

        {/* CRM Module Data */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900">CRM Module Mockup Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Pipeline Revenue (£)</label>
              <input
                type="number"
                step="0.01"
                value={config.crmTotalRevenue}
                onChange={(e) => handleInputChange("crmTotalRevenue", parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Active Client Count</label>
              <input
                type="number"
                value={config.crmClientCount}
                onChange={(e) => handleInputChange("crmClientCount", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700">Mock Contacts List (JSON Array)</label>
              <span className="text-xs text-gray-400">Needs name, email, stage, and value.</span>
            </div>
            <textarea
              rows={6}
              value={config.crmContactsJson}
              onChange={(e) => handleInputChange("crmContactsJson", e.target.value)}
              className={`w-full font-mono text-xs border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                crmJsonError ? "border-red-300 text-red-900 bg-red-50/50" : "border-gray-300 text-gray-900"
              }`}
            />
            {crmJsonError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {crmJsonError}
              </p>
            )}
          </div>
        </div>

        {/* Invoices Module Data */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900">Invoicing & VAT Mockup Data</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Unpaid Amount (£)</label>
              <input
                type="number"
                step="0.01"
                value={config.invTotalUnpaid}
                onChange={(e) => handleInputChange("invTotalUnpaid", parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Outstanding Invoices Count</label>
              <input
                type="number"
                value={config.invUnpaidCount}
                onChange={(e) => handleInputChange("invUnpaidCount", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700">Mock Invoices List (JSON Array)</label>
              <span className="text-xs text-gray-400">Needs number, client, amount, and status.</span>
            </div>
            <textarea
              rows={6}
              value={config.invInvoicesJson}
              onChange={(e) => handleInputChange("invInvoicesJson", e.target.value)}
              className={`w-full font-mono text-xs border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                invJsonError ? "border-red-300 text-red-900 bg-red-50/50" : "border-gray-300 text-gray-900"
              }`}
            />
            {invJsonError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {invJsonError}
              </p>
            )}
          </div>
        </div>

        {/* Tasks Module Data */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <ListTodo className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900">Task Tracker Mockup Data</h3>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700">Mock Tasks List (JSON Array)</label>
              <span className="text-xs text-gray-400">Needs id, title, status, and priority (HIGH/MEDIUM/LOW).</span>
            </div>
            <textarea
              rows={6}
              value={config.tasksJson}
              onChange={(e) => handleInputChange("tasksJson", e.target.value)}
              className={`w-full font-mono text-xs border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                tasksJsonError ? "border-red-300 text-red-900 bg-red-50/50" : "border-gray-300 text-gray-900"
              }`}
            />
            {tasksJsonError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {tasksJsonError}
              </p>
            )}
          </div>
        </div>

        {/* AI Synthesizer Module Data */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900">AI Synthesizer Feature Showcase</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Raw Meeting Notes Input Text</label>
            <textarea
              rows={3}
              value={config.aiInputText}
              onChange={(e) => handleInputChange("aiInputText", e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="e.g. John called about an order of 10 units..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-medium">Simulated AI Summarized Output Text</label>
            <textarea
              rows={4}
              value={config.aiOutputText}
              onChange={(e) => handleInputChange("aiOutputText", e.target.value)}
              className="w-full border border-gray-300 font-mono text-xs rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. • Client: John..."
            />
            <p className="text-xs text-gray-500 mt-1">This text will be mock-typed dynamically on the mockup preview card.</p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={fetchConfig}
            className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all"
          >
            Cancel & Revert
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 font-semibold text-sm flex items-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Mockup Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
