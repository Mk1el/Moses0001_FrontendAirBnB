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
      gap={3}
      mb={4}
      // Responsive layout
      sx={{
        gridTemplateColumns: {
          xs: "1fr",              
          sm: "repeat(2, 1fr)",   
          md: "repeat(3, 1fr)",   
          lg: "repeat(4, 1fr)",   
        },
        width: "100%",
      }}
    >
      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            bgcolor: "white",
            p: { xs: 2, sm: 3 }, 
            borderRadius: 3,
            border: "4px solid orange",
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: { xs: 150, sm: 180 },
            textAlign: "center",
            transition: "0.3s ease",
            "&:hover": {
              boxShadow: 6,
              transform: "translateY(-4px)",
            },
          }}
        >
          {/* Icon */}
          {item.icon && (
            <Box
              sx={{
                mb: 1.5,
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

          {/* Title */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            {item.title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h4"
            fontWeight={700}
            color={item.color || "text.primary"}
            sx={{
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2rem" }, 
            }}
          >
            {item.value}
          </Typography>

          {/* Subtitle */}
          {item.subtitle && (
            <Typography variant="caption" color="text.secondary">
              {item.subtitle}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DashboardWidget;
