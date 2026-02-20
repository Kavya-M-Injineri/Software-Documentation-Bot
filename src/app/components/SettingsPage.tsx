import { useState } from "react";
import { Save, Key, Bell, Shield, Database, Sliders } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    modelSelection: "gpt-4",
    multiLanguage: "en",
    notifications: true,
    autoSave: true,
    privateMode: false,
    maxTokens: 2000,
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Settings
        </h1>
        <p className="text-sm text-gray-600">
          Configure your DevDoc AI preferences and integrations.
        </p>
      </div>

      <div className="p-6 max-w-4xl">
        {/* Model Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Sliders className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Model Configuration
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model Selection
              </label>
              <select
                value={settings.modelSelection}
                onChange={(e) =>
                  setSettings({ ...settings, modelSelection: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option value="gpt-4">GPT-4 (Recommended)</option>
                <option value="gpt-3.5">GPT-3.5 Turbo</option>
                <option value="claude">Claude 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Response Tokens
              </label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, maxTokens: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              API Configuration
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                placeholder="sk-••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key is encrypted and stored securely
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Integration Token
              </label>
              <input
                type="password"
                placeholder="ghp_••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Enterprise Features
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Multi-Language Support</p>
                <p className="text-sm text-gray-500">
                  Choose your preferred interface language
                </p>
              </div>
              <select
                value={settings.multiLanguage}
                onChange={(e) =>
                  setSettings({ ...settings, multiLanguage: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Private Mode</p>
                <p className="text-sm text-gray-500">
                  Prevent queries from being logged
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, privateMode: !settings.privateMode })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.privateMode ? "bg-[#3B82F6]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.privateMode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Notifications</p>
                <p className="text-sm text-gray-500">
                  Get notified about new features and updates
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, notifications: !settings.notifications })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? "bg-[#3B82F6]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Save Answers</p>
                <p className="text-sm text-gray-500">
                  Automatically save important answers
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({ ...settings, autoSave: !settings.autoSave })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoSave ? "bg-[#3B82F6]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.autoSave ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Security & Privacy
            </h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">
                Update your account password
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">
                Add an extra layer of security
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm">
                Permanently delete your account and all data
              </p>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
