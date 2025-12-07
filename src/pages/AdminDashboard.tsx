import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardWidget from "../reusable-components/reusable-widget";

interface MonthlyData {
  month: string;
  earnings: number;
  bookings: number;
}

interface OccupancyData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface Metrics {
  guests: number;
  hosts: number;
  earnings: number;
  bookings: number;

}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function currency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<Metrics>({
    guests: 0,
    hosts: 0,
    earnings: 0,
    bookings: 0,
  });

  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyData[]>([]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const fakeMonthly: MonthlyData[] = [
        { month: "Jan", earnings: 12000, bookings: 340 },
        { month: "Feb", earnings: 9500, bookings: 260 },
        { month: "Mar", earnings: 14000, bookings: 390 },
        { month: "Apr", earnings: 17000, bookings: 460 },
        { month: "May", earnings: 15000, bookings: 420 },
        { month: "Jun", earnings: 19000, bookings: 520 },
        { month: "Jul", earnings: 21000, bookings: 610 },
        { month: "Aug", earnings: 18000, bookings: 540 },
        { month: "Sep", earnings: 16000, bookings: 480 },
        { month: "Oct", earnings: 22000, bookings: 650 },
        { month: "Nov", earnings: 24000, bookings: 700 },
        { month: "Dec", earnings: 26000, bookings: 760 },
      ];

      const totalEarnings = fakeMonthly.reduce((s, m) => s + m.earnings, 0);
      const totalBookings = fakeMonthly.reduce((s, m) => s + m.bookings, 0);

      setMonthly(fakeMonthly);
      setMetrics({
        guests: 12450,
        hosts: 320,
        earnings: totalEarnings,
        bookings: totalBookings,
      });
      setOccupancy([
        { name: "Occupied", value: 72 },
        { name: "Available", value: 18 },
        { name: "Maintenance", value: 10 },
      ]);
      setLoading(false);
    }, 700);

    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      // typed jitter
      const jitter = (v: number) =>
        Math.round(v * (0.9 + Math.random() * 0.2));

      const newMonthly = monthly.map((m) => ({
        ...m,
        earnings: jitter(m.earnings),
        bookings: jitter(m.bookings),
      }));

      const totalEarnings = newMonthly.reduce((s, m) => s + m.earnings, 0);
      const totalBookings = newMonthly.reduce((s, m) => s + m.bookings, 0);

      setMonthly(newMonthly);
      setMetrics((prev) => ({ ...prev, earnings: totalEarnings, bookings: totalBookings }));
      setLoading(false);
    }, 700);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f5f7fb", minHeight: "100vh" }}>
      <Grid container spacing={3} alignItems="stretch">
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
            <Box>
              <Typography variant="h5" component="div" fontWeight={700}>
                Airbnb Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overview & analytics
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={refresh} size="large" aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        {/* Metrics */}
        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Guests
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={24} /> : metrics.guests.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "rgba(0,136,254,0.12)", p: 1.5, borderRadius: 1 }}>
                  <PeopleIcon sx={{ fontSize: 32, color: "#0088FE" }} />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Active in last 30 days · {loading ? "—" : Math.round((metrics.bookings / 30) * 10) / 10} / day
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Hosts
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={24} /> : metrics.hosts.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "rgba(0,196,159,0.12)", p: 1.5, borderRadius: 1 }}>
                  <HomeIcon sx={{ fontSize: 32, color: "#00C49F" }} />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Verified hosts · {loading ? "—" : Math.round(metrics.hosts * 0.86)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Earnings (YTD)
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {loading ? <CircularProgress size={24} /> : currency(metrics.earnings)}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "rgba(255,128,66,0.12)", p: 1.5, borderRadius: 1 }}>
                  <MonetizationOnIcon sx={{ fontSize: 32, color: "#FF8042" }} />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Bookings: {loading ? "—" : metrics.bookings.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}
        <DashboardWidget
          items={[
            {
              title: "Total Guests",
              value: loading ? <CircularProgress size={24} /> : metrics.guests.toLocaleString(),
              icon: <PeopleIcon sx={{ fontSize: 32, color: "#0088FE", bgcolor: "rgba(0,136,254,0.12)", borderRadius: 1, p: 1.5 }} />,
              subtitle: loading ? "—" : `Active last 30d · ${Math.round((metrics.bookings / 30) * 10) / 10} / day`,
            },
            {
              title: "Total Hosts",
              value: loading ? <CircularProgress size={24} /> : metrics.hosts.toLocaleString(),
              icon: <HomeIcon sx={{ fontSize: 32, color: "#00C49F", bgcolor: "rgba(0,196,159,0.12)", borderRadius: 1, p: 1.5 }} />,
              subtitle: loading ? "—" : `Verified hosts · ${Math.round(metrics.hosts * 0.86)}`,
            },
            {
              title: "Earnings (YTD)",
              value: loading ? <CircularProgress size={24} /> : currency(metrics.earnings),
              icon: <MonetizationOnIcon sx={{ fontSize: 32, color: "#FF8042", bgcolor: "rgba(255,128,66,0.12)", borderRadius: 1, p: 1.5 }} />,
              subtitle: loading ? "—" : `Bookings: ${metrics.bookings.toLocaleString()}`,
            },
          ]}
        />

        {/* Charts */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Monthly Earnings
              </Typography>

              <Box sx={{ height: { xs: 240, md: 340 }, width: "100%" }}>
                {loading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={(value: number) => currency(value)} />
                      <Area type="monotone" dataKey="earnings" stroke="#8884d8" fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Occupancy Status
              </Typography>

              <Box sx={{ height: 280 }}>
                {loading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={occupancy} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} label>
                        {occupancy.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Bookings Trend
              </Typography>
              <Box sx={{ height: 220 }}>
                {loading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly} margin={{ left: -10 }}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="bookings" stroke="#00C49F" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Quick Insights
              </Typography>

              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">Top market: {loading ? "—" : "New York"}</Typography>
                <Typography variant="body2">
                  Avg. nightly rate: {loading ? "—" : currency(Math.round(metrics.earnings / Math.max(1, metrics.bookings)))}
                </Typography>
                <Typography variant="body2">Avg. occupancy: {loading ? "—" : `${occupancy[0]?.value ?? 0}%`}</Typography>
                <Typography variant="body2">New host signups (30d): {loading ? "—" : Math.round(metrics.hosts * 0.07)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary">
            Pro tip: Connect the metrics to your backend endpoints and replace the simulated fetch in useEffect with real API calls. Use pagination for lists and web sockets for live updates.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
