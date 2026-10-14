import React from 'react';

// Defect FCD05: Excessive multi-layer prop drilling through 4 intermediate layers without using the prop
export const Page = ({ onAvatarClick }: { onAvatarClick: () => void }) => <Section onAvatarClick={onAvatarClick} />;
const Section = ({ onAvatarClick }: any) => <CardList onAvatarClick={onAvatarClick} />;
const CardList = ({ onAvatarClick }: any) => <CardItem onAvatarClick={onAvatarClick} />;
const CardItem = ({ onAvatarClick }: any) => <button onClick={onAvatarClick}>Avatar</button>;

