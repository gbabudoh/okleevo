"use client";

import { useState } from "react";
import Link from "next/link";

export default function DebugLoginPage() {
  const [email, setEmail] = useState("admin@okleevo.com");
  const [password, setPassword] = useState("Admin123!@#");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/check-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const verifySuperAdmin = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/verify-super-admin");
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fixLogin = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/fix-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href="/admin/access" className="text-blue-600 hover:underline">
            ← Back to Admin Login
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">Login Debug Tool</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Login Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={fixLogin}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-semibold"
              >
                {loading ? "Fixing..." : "🔧 FIX LOGIN NOW"}
              </button>
              <button
                onClick={checkAuth}
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {loading ? "Checking..." : "🔍 Check Auth Flow"}
              </button>
              <button
                onClick={verifySuperAdmin}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Super Admin"}
              </button>
              <button
                onClick={testLogin}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Testing..." : "Test Login"}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>Click "🔧 FIX LOGIN NOW"</strong> - This will create/fix the super admin user and ensure login works</li>
            <li>Click "Verify Super Admin" to check if the user exists and fix any issues</li>
            <li>Click "Test Login" to verify the credentials work</li>
            <li>Check the server console for detailed authentication logs</li>
            <li>After fixing, try logging in at: <a href="/admin/access" className="text-blue-600 underline">/admin/access</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

