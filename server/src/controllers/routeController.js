import { store, saveStoreToDisk } from "../db.js";

// List all routes (public / protected)
export const getRoutes = async (req, res) => {
  try {
    const routes = store.routes.map((r) => {
      const activeStudents = store.passes.filter(
        (p) => p.routeId === r.routeId && p.status === "active"
      ).length;
      return {
        ...r,
        activeStudents,
      };
    });

    res.status(200).json({ success: true, count: routes.length, routes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching route directory." });
  }
};

// Create a new bus route (Admin only)
export const createRoute = async (req, res) => {
  try {
    const { routeName, busNumber, driverName, driverPhone, capacity, stops } = req.body;

    if (!routeName || !busNumber) {
      return res.status(400).json({ success: false, message: "Route name and bus number are required." });
    }

    const routeId = `ROUTE-${String(store.routes.length + 1).padStart(2, "0")}`;

    const newRoute = {
      routeId,
      routeName: routeName.trim(),
      busNumber: busNumber.trim().toUpperCase(),
      driverName: driverName?.trim() || "Assigned Driver",
      driverPhone: driverPhone?.trim() || "+91 98000 00000",
      capacity: Number(capacity) || 50,
      stops: Array.isArray(stops) && stops.length > 0 ? stops : [
        { stopName: "Departure Depot", stopOrder: 1, morningTime: "07:30 AM", eveningTime: "05:30 PM" },
        { stopName: "Campus Gate", stopOrder: 2, morningTime: "08:30 AM", eveningTime: "04:30 PM" },
      ],
      isActive: true,
    };

    store.routes.push(newRoute);
    saveStoreToDisk();

    res.status(201).json({
      success: true,
      message: `Route ${newRoute.routeName} registered successfully!`,
      route: newRoute,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating route." });
  }
};

// Update existing route (Admin only)
export const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { routeName, busNumber, driverName, driverPhone, capacity, stops, isActive } = req.body;

    const routeIndex = store.routes.findIndex((r) => r.routeId === routeId);
    if (routeIndex === -1) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }

    const existing = store.routes[routeIndex];
    store.routes[routeIndex] = {
      ...existing,
      routeName: routeName !== undefined ? routeName.trim() : existing.routeName,
      busNumber: busNumber !== undefined ? busNumber.trim().toUpperCase() : existing.busNumber,
      driverName: driverName !== undefined ? driverName.trim() : existing.driverName,
      driverPhone: driverPhone !== undefined ? driverPhone.trim() : existing.driverPhone,
      capacity: capacity !== undefined ? Number(capacity) : existing.capacity,
      stops: stops !== undefined ? stops : existing.stops,
      isActive: isActive !== undefined ? isActive : existing.isActive,
    };

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: "Route updated successfully!",
      route: store.routes[routeIndex],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating route." });
  }
};

// Delete / Deactivate route (Admin only)
export const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeIndex = store.routes.findIndex((r) => r.routeId === routeId);
    if (routeIndex === -1) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }

    // Check if passes are using this route
    const inUseCount = store.passes.filter((p) => p.routeId === routeId && p.status === "active").length;
    if (inUseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete route with ${inUseCount} active student pass(es). Please reassign students first.`,
      });
    }

    store.routes.splice(routeIndex, 1);
    saveStoreToDisk();

    res.status(200).json({ success: true, message: "Route removed from directory." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting route." });
  }
};
