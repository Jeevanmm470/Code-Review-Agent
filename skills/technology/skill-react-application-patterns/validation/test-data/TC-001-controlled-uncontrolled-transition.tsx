import React, { useState, useEffect } from 'react';

interface UserProfileData {
  username?: string;
  bio?: string;
}

// ❌ Flawed: Uncontrolled to controlled transition when initial prop is undefined
export function FlawedUserProfileEditor({ initialData }: { initialData?: UserProfileData }) {
  // initialData is undefined initially, so bio is initialized to undefined (uncontrolled)
  const [bio, setBio] = useState(initialData?.bio);

  useEffect(() => {
    if (initialData?.bio) {
      setBio(initialData.bio); // Switches to string (controlled) -> React runtime warning
    }
  }, [initialData]);

  return (
    <div>
      <label htmlFor="bio-input">Biography</label>
      <input
        id="bio-input"
        type="text"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
    </div>
  );
}

// ✅ Safe: Always guarantees a defined fallback string value
export function SafeUserProfileEditor({ initialData }: { initialData?: UserProfileData }) {
  const [bio, setBio] = useState(initialData?.bio ?? '');

  useEffect(() => {
    if (initialData?.bio !== undefined) {
      setBio(initialData.bio);
    }
  }, [initialData?.bio]);

  return (
    <div>
      <label htmlFor="bio-safe-input">Biography</label>
      <input
        id="bio-safe-input"
        type="text"
        value={bio ?? ''}
        onChange={(e) => setBio(e.target.value)}
      />
    </div>
  );
}

