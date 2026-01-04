import React, { createContext, useContext, useEffect, useState } from "react";

const ReportListContext = createContext();

export function useReportList() {
  const context = useContext(ReportListContext);
  if (!context) throw new Error("useReportList must be used within a ReportListProvider");
  return context;
}

export default function ReportListProvider({ children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  const basePath = "/report";

  const _throwHttpError = async (response) => {
    let msg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      msg = errorData?.message || errorData?.errorMessage || errorData?.error || msg;
    } catch {
      // fallback msg
    }
    throw new Error(msg);
  };

  const _handleError = (err, fallbackMessage) => {
    const message = err?.message || fallbackMessage || "Unexpected error";
    setError(message);
    setStatus("error");
    console.error("[ReportListProvider]", err);
    throw err;
  };

  const _requestJson = async (path, { method = "GET", body } = {}) => {
    const response = await fetch(path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) await _throwHttpError(response);

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  // GET /report/list
  const list = async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await _requestJson(`${basePath}/list`);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to fetch reports");
    }
  };

  // POST /report/create
  const create = async (dto) => {
    setStatus("loading");
    setError(null);
    try {
      const created = await _requestJson(`${basePath}/create`, { method: "POST", body: dto });
      await list();
      return created;
    } catch (err) {
      _handleError(err, "Failed to create report");
    }
  };

  // POST /report/update
  const update = async (dto) => {
    setStatus("loading");
    setError(null);
    try {
      const updated = await _requestJson(`${basePath}/update`, { method: "POST", body: dto });
      await list();
      return updated;
    } catch (err) {
      _handleError(err, "Failed to update report");
    }
  };

  // POST /report/delete  { id }
  const remove = async (id) => {
    setStatus("loading");
    setError(null);
    try {
      await _requestJson(`${basePath}/delete`, { method: "POST", body: { id } });
      await list();
    } catch (err) {
      _handleError(err, "Failed to delete report");
    }
  };

  // GET /report/get?id=...
  const get = async (id) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/get?id=${encodeURIComponent(String(id))}`;
      const result = await _requestJson(url);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to get report");
    }
  };

  // GET /report/getByTrackingCode?trackingCode=...
  const getByTrackingCode = async (trackingCode) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/getByTrackingCode?trackingCode=${encodeURIComponent(
        String(trackingCode)
      )}`;
      const result = await _requestJson(url);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to get report by tracking code");
    }
  };

  // GET /report/listByStopId?stopId=...
  const listByStopId = async (stopId) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/listByStopId?stopId=${encodeURIComponent(String(stopId))}`;
      const result = await _requestJson(url);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to fetch reports by stopId");
    }
  };

  useEffect(() => {
    list().catch(() => {});
  }, []);

  const value = {
    data,
    status,
    error,
    handlerMap: {
      list,
      create,
      update,
      delete: remove,
      remove,
      get,
      getByTrackingCode,
      listByStopId,
    },
  };

  return <ReportListContext.Provider value={value}>{children}</ReportListContext.Provider>;
}
