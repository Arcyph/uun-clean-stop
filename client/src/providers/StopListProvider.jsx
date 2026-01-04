import React, { createContext, useContext, useEffect, useState } from "react";

const StopListContext = createContext();

export function useStopList() {
  const context = useContext(StopListContext);
  if (!context) throw new Error("useStopList must be used within a StopListProvider");
  return context;
}

export default function StopListProvider({ children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const basePath = "/stop";

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
    console.error("[StopListProvider]", err);
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

  // GET /stop/list
  const list = async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await _requestJson(`${basePath}/list`);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to fetch stops");
    }
  };

  // POST /stop/create
  const create = async (dto) => {
    setStatus("loading");
    setError(null);
    try {
      const created = await _requestJson(`${basePath}/create`, { method: "POST", body: dto });
      await list();
      return created;
    } catch (err) {
      _handleError(err, "Failed to create stop");
    }
  };

  // POST /stop/update
  const update = async (dto) => {
    setStatus("loading");
    setError(null);
    try {
      const updated = await _requestJson(`${basePath}/update`, { method: "POST", body: dto });
      await list();
      return updated;
    } catch (err) {
      _handleError(err, "Failed to update stop");
    }
  };

  // POST /stop/delete  { id }
  const remove = async (id) => {
    setStatus("loading");
    setError(null);
    try {
      await _requestJson(`${basePath}/delete`, { method: "POST", body: { id } });
      await list();
    } catch (err) {
      _handleError(err, "Failed to delete stop");
    }
  };

  // GET /stop/get?id=...
  const get = async (id) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/get?id=${encodeURIComponent(String(id))}`;
      const result = await _requestJson(url);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to get stop");
    }
  };

  // GET /stop/getByCode?code=...
  const getByCode = async (code) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/getByCode?code=${encodeURIComponent(String(code))}`;
      const result = await _requestJson(url);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to get stop by code");
    }
  };

  // GET /stop/listWithReportStats
  const listWithReportStats = async () => {
    setStatus("loading");
    setError(null);
    try {
      const result = await _requestJson(`${basePath}/listWithReportStats`);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to fetch stops with report stats");
    }
  };

  // GET /stop/geojsonByBbox?bbox=...
  const geojsonByBbox = async (bboxString) => {
    setStatus("loading");
    setError(null);
    try {
      const url = `${basePath}/geojsonByBbox?bbox=${encodeURIComponent(String(bboxString))}`;
      const result = await _requestJson(url);
      setStatus("success");
      return result;
    } catch (err) {
      _handleError(err, "Failed to fetch geojson by bbox");
    }
  };

  useEffect(() => {
    listWithReportStats().catch(() => {});
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
      getByCode,
      listWithReportStats,
      geojsonByBbox,
    },
  };

  return <StopListContext.Provider value={value}>{children}</StopListContext.Provider>;
}
