
import React from 'react';
import { Icons } from '../constants';

/**
 * Re-defining social platforms here to avoid circular dependencies or TSX issues if needed, 
 * or exporting directly if constants.tsx is clean.
 */
export const socialPlatforms = [
  { id: 'yt', name: 'YouTube', icon: React.createElement(Icons.Series), connected: true },
  { id: 'tt', name: 'TikTok', icon: React.createElement(Icons.Stories), connected: false },
  { id: 'ig', name: 'Instagram', icon: React.createElement(Icons.Video), connected: false },
];
