import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useAuth } from "../contexts/AuthContext.jsx";

const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultMarkerIcon;

function MapSync({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [coords, map]);
  return null;
}

function LocationMarker({ coords, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return coords ? <Marker position={[coords.lat, coords.lng]} /> : null;
}

export default function CreateIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Road");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [placeResults, setPlaceResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const suppressSearchRef = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultCenter = useMemo(() => ({ lat: 27.7172, lng: 85.3240 }), []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const applyCoords = (nextCoords) => {
    setCoords(nextCoords);
  };

  const handleMapSelect = (lat, lng) => {
    applyCoords({ lat, lng });
    resolveLocationName(lat, lng);
  };

  const resolveLocationName = async (lat, lng) => {
    try {
      setIsResolvingLocation(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        throw new Error("Failed to resolve location");
      }
      const data = await res.json();
      const name = data?.display_name;
      if (name) {
        suppressSearchRef.current = true;
        setLocation(name);
        setPlaceResults([]);
      } else {
        suppressSearchRef.current = true;
        setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      suppressSearchRef.current = true;
      setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const applyPlaceSelection = (place) => {
    const nextCoords = {
      lat: Number(place.lat),
      lng: Number(place.lon),
    };
    suppressSearchRef.current = true;
    setLocation(place.display_name);
    setPlaceResults([]);
    applyCoords(nextCoords);
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by this browser");
    }
    setIsLocating(true);
    let settled = false;
    let bestPos = null;
    let watchId = null;
    let timeoutId = null;

    const finish = (pos) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const nextCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      applyCoords(nextCoords);
      resolveLocationName(nextCoords.lat, nextCoords.lng);
      if (pos.coords.accuracy && pos.coords.accuracy > 80) {
        toast("Location is approximate. Move to open sky for better accuracy.", {
          icon: "📍",
        });
      }
      setIsLocating(false);
    };

    const handleError = () => {
      if (settled) return;
      if (bestPos) {
        finish(bestPos);
        return;
      }
      setIsLocating(false);
      toast.error("Unable to access your location");
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
          bestPos = pos;
        }
        if (pos.coords.accuracy && pos.coords.accuracy <= 30) {
          finish(pos);
        }
      },
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    timeoutId = setTimeout(() => {
      if (!settled) {
        if (bestPos) {
          finish(bestPos);
        } else {
          handleError();
        }
      }
    }, 8000);
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) return toast.error("All fields required");

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to report an issue");
        return navigate("/login");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("category", category);
      if (coords) {
        formData.append("latitude", coords.lat);
        formData.append("longitude", coords.lng);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("http://localhost:5000/api/v1/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Issue reported successfully!");
        navigate("/issues");
      } else {
        toast.error(data.message || "Failed to submit issue");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      setIsSearchingPlaces(false);
      return;
    }

    const query = location.trim();
    if (query.length < 3) {
      setPlaceResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearchingPlaces(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setPlaceResults([]);
          return;
        }
        const data = await res.json();
        setPlaceResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setPlaceResults([]);
        }
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [location]);

  if (user?.role && user.role !== "user") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-white">
        <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-3">Issue Reporting Disabled</h2>
          <p className="text-gray-300">
            Only regular users can create issues. Authority and admin accounts can track and update progress.
          </p>
          <button
            onClick={() => navigate("/issues")}
            className="mt-5 px-5 py-3 rounded-md bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white text-sm font-semibold"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Report an Issue</h2>
      <form onSubmit={onSubmit} className="grid gap-5">
        <input
          className="px-5 py-4 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="px-5 py-4 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none min-h-[160px]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="relative">
          <input
            className="w-full px-5 py-4 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none"
            placeholder="Location (start typing to search)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {isSearchingPlaces && (
            <div className="absolute right-4 top-4 text-xs text-gray-400">Searching...</div>
          )}
          {placeResults.length > 0 && (
            <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-lg border border-[#4a1b1b] bg-[#1D0515] shadow-xl">
              {placeResults.map((place) => (
                <button
                  type="button"
                  key={`${place.place_id}-${place.lat}`}
                  onClick={() => applyPlaceSelection(place)}
                  className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#3b1416] transition"
                >
                  {place.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          className="px-5 py-4 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-lg outline-none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Road</option>
          <option>Water</option>
          <option>Electricity</option>
        </select>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Pick Location on Map</label>
            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={isLocating}
              className="px-4 py-2 rounded-md bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition text-xs disabled:opacity-50"
            >
              {isLocating ? "Locating..." : "Use Current Location"}
            </button>
          </div>
          <div className="text-xs text-gray-400">
            {isResolvingLocation
              ? "Resolving location..."
              : coords
                ? location
                  ? `Selected: ${location}`
                  : `Selected: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                : "Click on the map to drop a pin."}
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-[#4a1b1b]">
            <MapContainer
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker coords={coords} onSelect={handleMapSelect} />
              <MapSync coords={coords} />
            </MapContainer>
          </div>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-gray-300">Upload Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="px-5 py-3 rounded-md bg-[#3b1416] border border-[#5a1f21] text-white text-sm"
          />
          {imagePreview && (
            <div className="bg-[#2b0f12]/80 border border-[#4a1b1b] rounded-xl p-3">
              <img
                src={imagePreview}
                alt="Issue preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="mt-3 px-4 py-2 rounded-md bg-[#3b1416] text-white hover:bg-[#4a1b1b] transition text-sm"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="mt-2 px-5 py-4 rounded-md bg-[#9A0D1B] hover:bg-[#7A0A15] transition text-white text-lg font-semibold disabled:opacity-50"
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}
