export function NoScriptFallback() {
  return (
    <noscript>
      <div className="min-h-screen flex items-center justify-center p-4 bg-yellow-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md border border-yellow-400">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">JavaScript Required</h2>
              <p className="text-gray-700 mb-3">
                This todo application requires JavaScript to function properly.
              </p>
              <p className="text-sm text-gray-600">
                Please enable JavaScript in your browser settings to use this app.
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">How to enable JavaScript:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Chrome: Settings → Privacy and security → Site Settings → JavaScript</li>
                  <li>Firefox: about:config → javascript.enabled → true</li>
                  <li>Safari: Preferences → Security → Enable JavaScript</li>
                  <li>Edge: Settings → Cookies and site permissions → JavaScript</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </noscript>
  );
}
