import React from 'react';
import Grid from '@mui/material/Grid2'; // MUI v6 Grid2 API

// VIOLATION: Using legacy v4/v5 props (item, xs={12}) on MUI v6 Grid2 component
export function GridVersionMismatchViolation() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <div>Left Pane</div>
      </Grid>
      <Grid item xs={12} md={6}>
        <div>Right Pane</div>
      </Grid>
    </Grid>
  );
}

// SAFE: Using v6 size prop syntax on Grid2
export function SafeMui6GridUsage() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <div>Left Pane</div>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <div>Right Pane</div>
      </Grid>
    </Grid>
  );
}

