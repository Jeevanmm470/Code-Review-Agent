// TC-009: Route-Level Data Loading & Race Conditions Defect (FRN09)
// Route data fetching does not abort in-flight requests on route change, causing stale resolution.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function UserProfileView() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Defect: No AbortController or mounted check; slower earlier fetch will overwrite newer response
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      });
  }, [userId]);

  return <div>{profile ? profile.name : 'Loading...'}</div>;
}

