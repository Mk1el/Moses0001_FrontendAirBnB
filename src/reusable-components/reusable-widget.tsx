import React from "react";
import { Box, Typography } from "@mui/material";

interface WidgetItem {
  title: string;
  value: string | number | React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

interface DashboardWidgetProps {
  items: WidgetItem[];
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ items, className }) => {
  return (
    <Box
      className={className}
      display="grid"
      gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
      gap={3}
      mb={4} // spacing from charts below
    >
      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            bgcolor: "white",
            p: 3,
            borderRadius: 3,
            border: "4px solid orange", // thick orange border
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between", // utilizes vertical space
            minHeight: 180, // ensures each widget has enough height
            transition: "0.3s",
            "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
          }}
        >
          {item.icon && (
            <Box
              sx={{
                mb: 2,
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                boxShadow: 1,
              }}
            >
              {item.icon}
            </Box>
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: "center", mb: 0.5 }}>
            {item.title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            color={item.color || "text.primary"}
            sx={{ textAlign: "center", mb: 1 }}
          >
            {item.value}
          </Typography>

          {item.subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {item.subtitle}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DashboardWidget;
