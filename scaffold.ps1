$folders = @(
"app",
"app/(auth)",
"app/(auth)/login",

"app/(dashboard)",
"app/(dashboard)/zones",
"app/(dashboard)/zones/map",
"app/(dashboard)/zones/[zoneId]",
"app/(dashboard)/zones/[zoneId]/configure",

"app/(dashboard)/roster",
"app/(dashboard)/roster/[zoneId]",

"app/(dashboard)/personnel",
"app/(dashboard)/personnel/[officerId]",

"app/(dashboard)/incidents",
"app/(dashboard)/settings",

"app/api/auth/[...nextauth]",

"app/api/zones",
"app/api/zones/redistribute",
"app/api/zones/[zoneId]",
"app/api/zones/[zoneId]/deploy",
"app/api/zones/[zoneId]/incident",

"app/api/personnel",
"app/api/personnel/available",
"app/api/personnel/[officerId]",
"app/api/personnel/[officerId]/leave",
"app/api/personnel/[officerId]/fatigue",

"app/api/roster",
"app/api/roster/shift",
"app/api/roster/[date]",

"app/api/graph",
"app/api/health",

"components/ui",
"components/dashboard",
"components/forms",
"components/charts",

"lib/db/models",
"lib/algorithms/deficitResolver",
"lib/algorithms/graph",
"lib/validators",
"lib/types",
"lib/constants",

"hooks",
"stores",

"public/assets"
)

foreach ($folder in $folders) {
New-Item -ItemType Directory -Force -Path $folder
}

$files = @(
"app/layout.tsx",
"app/globals.css",

"app/(auth)/layout.tsx",
"app/(auth)/login/page.tsx",

"app/(dashboard)/layout.tsx",
"app/(dashboard)/page.tsx",

"app/(dashboard)/zones/page.tsx",
"app/(dashboard)/zones/map/page.tsx",
"app/(dashboard)/zones/[zoneId]/page.tsx",
"app/(dashboard)/zones/[zoneId]/configure/page.tsx",

"app/(dashboard)/roster/page.tsx",
"app/(dashboard)/roster/[zoneId]/page.tsx",

"app/(dashboard)/personnel/page.tsx",
"app/(dashboard)/personnel/[officerId]/page.tsx",

"app/(dashboard)/incidents/page.tsx",
"app/(dashboard)/settings/page.tsx",

"app/api/auth/[...nextauth]/route.ts",

"app/api/zones/route.ts",
"app/api/zones/redistribute/route.ts",
"app/api/zones/[zoneId]/route.ts",
"app/api/zones/[zoneId]/deploy/route.ts",
"app/api/zones/[zoneId]/incident/route.ts",

"app/api/personnel/route.ts",
"app/api/personnel/available/route.ts",
"app/api/personnel/[officerId]/route.ts",
"app/api/personnel/[officerId]/leave/route.ts",
"app/api/personnel/[officerId]/fatigue/route.ts",

"app/api/roster/route.ts",
"app/api/roster/shift/route.ts",
"app/api/roster/[date]/route.ts",

"app/api/graph/route.ts",
"app/api/health/route.ts",

"lib/db/mongodb.ts",
"middleware.ts",
"setup.sh",
"web.sh"
)

foreach ($file in $files) {
New-Item -ItemType File -Force -Path $file
}

Write-Host "Operation Sentinel structure created successfully 🚔"
