'use client';

import { useState, useEffect } from 'react';

interface Log {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: any;
  session_id?: string;
  endpoint?: string;
  stack_trace?: string;
  created_at: string;
}

interface LogsResponse {
  logs: Log[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    level: string | null;
    sessionId: string | null;
    endpoint: string | null;
    since: string | null;
    before: string | null;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    sessionId: '',
    endpoint: '',
    limit: '100',
  });
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    total: 0,
    hasMore: false,
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      if (filters.endpoint) params.append('endpoint', filters.endpoint);
      params.append('limit', filters.limit);
      params.append('offset', pagination.offset.toString());

      const response = await fetch(`/api/debug/logs?${params.toString()}`);
      const data: LogsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs');
      }

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.offset]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'debug':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Application Logs</h1>
          <p className="text-gray-600 mb-6">
            View and filter application logs stored in Supabase. Share this page with contributors for debugging.
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session ID
              </label>
              <input
                type="text"
                value={filters.sessionId}
                onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                placeholder="Filter by session..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint
              </label>
              <input
                type="text"
                value={filters.endpoint}
                onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
                placeholder="Filter by endpoint..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setPagination({ ...pagination, offset: 0 });
              fetchLogs();
            }}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading logs...</p>
            </div>
          )}

          {/* Logs list */}
          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {logs.length} of {pagination.total} logs
              </div>

              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No logs found matching your filters.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`border rounded-lg p-4 ${getLevelColor(log.level)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold uppercase text-xs">
                            {log.level}
                          </span>
                          {log.endpoint && (
                            <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                              {log.endpoint}
                            </span>
                          )}
                        </div>
                        <span className="text-xs opacity-75">
                          {formatDate(log.created_at)}
                        </span>
                      </div>

                      <div className="font-mono text-sm mb-2">{log.message}</div>

                      {log.session_id && (
                        <div className="text-xs opacity-75 mb-1">
                          Session: {log.session_id}
                        </div>
                      )}

                      {log.context && Object.keys(log.context).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer opacity-75">
                            Context
                          </summary>
                          <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.stack_trace && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer opacity-75">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                            {log.stack_trace}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        offset: Math.max(0, pagination.offset - pagination.limit),
                      })
                    }
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
                    {Math.ceil(pagination.total / pagination.limit)}
                  </span>

                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        offset: pagination.offset + pagination.limit,
                      })
                    }
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">How to share logs with contributors:</h2>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Share the URL of this page with contributors</li>
            <li>Or share the API endpoint: <code className="bg-blue-100 px-1 rounded">/api/debug/logs</code></li>
            <li>Contributors can also view logs directly in Supabase dashboard under the <code className="bg-blue-100 px-1 rounded">logs</code> table</li>
            <li>Use filters to narrow down specific errors or sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

