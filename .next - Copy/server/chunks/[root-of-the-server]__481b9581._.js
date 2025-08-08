module.exports = {

"[project]/.next-internal/server/app/api/rms/platforms-devices/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/api/rms/platforms-devices/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// app/api/rms/platforms-devices/route.ts
__turbopack_context__.s({
    "DELETE": ()=>DELETE,
    "GET": ()=>GET,
    "POST": ()=>POST,
    "PUT": ()=>PUT
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Mock database
let devices = [
    {
        id: 'DEV001',
        name: 'Main Server',
        location: 'Data Center A',
        status: 'active',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'DEV002',
        name: 'Backup Server',
        location: 'Data Center B',
        status: 'inactive',
        lastUpdated: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'DEV003',
        name: 'Edge Router',
        location: 'Office Floor 1',
        status: 'active',
        lastUpdated: new Date().toISOString()
    }
];
// Helper function to find device by ID
const findDeviceById = (id)=>{
    return devices.find((device)=>device.id === id);
};
// Helper function to generate new device ID
const generateDeviceId = ()=>{
    const maxId = devices.reduce((max, device)=>{
        const numId = parseInt(device.id.replace('DEV', ''));
        return numId > max ? numId : max;
    }, 0);
    return `DEV${String(maxId + 1).padStart(3, '0')}`;
};
async function GET() {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Devices fetched successfully',
            data: devices,
            count: devices.length
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch devices',
            message: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const body = await req.json();
        // Validation
        if (!body.name || !body.location) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Validation failed',
                message: 'Device name and location are required'
            }, {
                status: 400
            });
        }
        // Check if device name already exists
        const existingDevice = devices.find((device)=>device.name.toLowerCase() === body.name.toLowerCase());
        if (existingDevice) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Device name already exists',
                message: 'A device with this name already exists'
            }, {
                status: 409
            });
        }
        const newDevice = {
            id: generateDeviceId(),
            name: body.name.trim(),
            location: body.location.trim(),
            status: body.status || 'active',
            lastUpdated: new Date().toISOString()
        };
        devices.push(newDevice);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Device added successfully',
            device: newDevice
        }, {
            status: 201
        });
    } catch (error) {
        console.error('POST Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to add device'
        }, {
            status: 500
        });
    }
}
async function PUT(req) {
    try {
        const body = await req.json();
        // Validation
        if (!body.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Device ID is required',
                message: 'Device ID must be provided for updates'
            }, {
                status: 400
            });
        }
        const deviceIndex = devices.findIndex((device)=>device.id === body.id);
        if (deviceIndex === -1) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Device not found',
                message: `Device with ID ${body.id} does not exist`
            }, {
                status: 404
            });
        }
        // Check if new name conflicts with existing devices (excluding current device)
        if (body.name) {
            const nameConflict = devices.find((device)=>device.id !== body.id && device.name.toLowerCase() === body.name.toLowerCase());
            if (nameConflict) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Device name already exists',
                    message: 'A device with this name already exists'
                }, {
                    status: 409
                });
            }
        }
        // Update device
        const updatedDevice = {
            ...devices[deviceIndex],
            ...body.name && {
                name: body.name.trim()
            },
            ...body.location && {
                location: body.location.trim()
            },
            ...body.status && {
                status: body.status
            },
            lastUpdated: new Date().toISOString()
        };
        devices[deviceIndex] = updatedDevice;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Device updated successfully',
            device: updatedDevice
        });
    } catch (error) {
        console.error('PUT Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to update device'
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    try {
        const url = new URL(req.url);
        const deviceId = url.searchParams.get('id');
        if (!deviceId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Device ID is required',
                message: 'Device ID must be provided for deletion'
            }, {
                status: 400
            });
        }
        const deviceIndex = devices.findIndex((device)=>device.id === deviceId);
        if (deviceIndex === -1) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Device not found',
                message: `Device with ID ${deviceId} does not exist`
            }, {
                status: 404
            });
        }
        const deletedDevice = devices[deviceIndex];
        devices.splice(deviceIndex, 1);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Device deleted successfully',
            device: deletedDevice
        });
    } catch (error) {
        console.error('DELETE Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to delete device'
        }, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__481b9581._.js.map