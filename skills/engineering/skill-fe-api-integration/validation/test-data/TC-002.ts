interface UserResponse {
  id: string;
  name: string;
  profile: {
    avatarUrl: string;
    settings: {
      theme: string;
    };
  };
}

export const fetchUserProfile = async (userId: string): Promise<UserResponse> => {
  const res = await fetch(`/api/users/${userId}`);
  const data = await res.json();
  // Defect FAI02: Unchecked type assertion without runtime validation throws on optional/null profile
  return {
    id: data.id,
    name: data.name,
    profile: {
      avatarUrl: data.profile.avatarUrl,
      settings: {
        theme: data.profile.settings.theme,
      },
    },
  };
};

