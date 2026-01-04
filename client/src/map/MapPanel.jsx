import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { useAppRefresh } from "../providers/AppRefreshProvider";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const PRAGUE_BBOX = [14.20, 49.94, 14.72, 50.18];

function expandBbox(bbox, ratio = 0.25) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const dx = (maxLng - minLng) * ratio;
  const dy = (maxLat - minLat) * ratio;
  return [minLng - dx, minLat - dy, maxLng + dx, maxLat + dy];
}

function mapBbox(map) {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

function bboxContains(outer, inner) {
  const [oMinLng, oMinLat, oMaxLng, oMaxLat] = outer;
  const [iMinLng, iMinLat, iMaxLng, iMaxLat] = inner;
  return iMinLng >= oMinLng && iMinLat >= oMinLat && iMaxLng <= oMaxLng && iMaxLat <= oMaxLat;
}

function normalizeGeojson(fc) {
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    return { type: "FeatureCollection", features: [] };
  }

  const features = fc.features
    .filter((f) => f && f.type === "Feature" && f.geometry)
    .map((f, idx) => {
      const props = { ...(f.properties ?? {}) };
      const id =
        props.id ??
        props.stopId ??
        props.stop_id ??
        f.id ??
        props.code ??
        idx;

      props.id = String(id);
      return { ...f, id: props.id, properties: props };
    });

  return { ...fc, features };
}

export default function MapPanel() {
  const navigate = useNavigate();
  const { stopId } = useParams();
  const { revision } = useAppRefresh();

  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const abortRef = useRef(null);
  const fetchedBboxRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);

  const initialBounds = useMemo(() => PRAGUE_BBOX, []);

  useEffect(() => {
    setSelectedId(stopId ? String(stopId) : null);
  }, [stopId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds: initialBounds,
      fitBoundsOptions: { padding: 20, duration: 0 },
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const SOURCE_ID = "stops";
    const LAYER_POINTS = "stops-points";
    const LAYER_HALO = "stops-halo";

    async function fetchStopsGeojson(bbox) {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const bboxStr = bbox.map((n) => Number(n).toFixed(6)).join(",");
      const res = await fetch(`/stop/geojsonByBbox?bbox=${encodeURIComponent(bboxStr)}`, {
        signal: ac.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Map data error: HTTP ${res.status} ${txt}`);
      }

      return normalizeGeojson(await res.json());
    }

    function upsertData(fc) {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, { type: "geojson", data: fc });

        map.addLayer({
          id: LAYER_HALO,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-radius": 22,
            "circle-color": "#8b1b3a",
            "circle-opacity": 0.18,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#8b1b3a",
            "circle-stroke-opacity": 0.45,
          },
          filter: ["==", ["get", "id"], ""],
        });

        map.addLayer({
          id: LAYER_POINTS,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-radius": 7,
            "circle-color": "#8b1b3a",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        map.on("click", LAYER_POINTS, (e) => {
          const feature = e?.features?.[0];
          const id = feature?.properties?.id;
          if (!id) return;
          navigate(`/stops/${String(id)}`);
        });

        map.on("mouseenter", LAYER_POINTS, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", LAYER_POINTS, () => (map.getCanvas().style.cursor = ""));
      } else {
        map.getSource(SOURCE_ID).setData(fc);
      }
    }

    async function loadInitial() {
      const bbox = expandBbox(PRAGUE_BBOX, 0.25);
      fetchedBboxRef.current = bbox;
      const fc = await fetchStopsGeojson(bbox);
      upsertData(fc);
    }

    map.on("load", () => {
      loadInitial().catch(console.error);
      setTimeout(() => map.resize(), 0);
    });

    const onMoveEnd = () => {
      const fetched = fetchedBboxRef.current;
      if (!fetched) return;

      const current = mapBbox(map);
      if (bboxContains(fetched, current)) return;

      const next = expandBbox(current, 0.25);
      fetchedBboxRef.current = next;

      fetchStopsGeojson(next)
        .then((fc) => upsertData(fc))
        .catch((e) => {
          if (String(e?.name) === "AbortError") return;
          console.error(e);
        });
    };

    map.on("moveend", onMoveEnd);

    return () => {
      try {
        if (abortRef.current) abortRef.current.abort();
      } catch {}
      try {
        map.remove();
      } catch {}
    };
  }, [initialBounds, navigate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer("stops-halo")) return;

    map.setFilter("stops-halo", ["==", ["get", "id"], selectedId ? String(selectedId) : ""]);
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const fetched = fetchedBboxRef.current;
    if (!fetched) return;

    const bboxStr = fetched.map((n) => Number(n).toFixed(6)).join(",");
    fetch(`/stop/geojsonByBbox?bbox=${encodeURIComponent(bboxStr)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("GeoJSON reload failed"))))
      .then((json) => {
        const fc = normalizeGeojson(json);
        const src = map.getSource("stops");
        if (src) src.setData(fc);
      })
      .catch(() => {});
  }, [revision]);

  return <div ref={containerRef} className="mapboxContainer" />;
}
