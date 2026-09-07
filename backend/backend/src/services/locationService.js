// src/services/locationService.js
import fetch from 'node-fetch';

// Get location from IP address using free API
export async function getLocationFromIP(ip) {
  try {
    // Skip for localhost/development
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      return {
        city: 'Localhost',
        region: 'Development',
        country: 'Dev',
        timezone: 'UTC',
      };
    }

    // Use free IP geolocation API
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,regionName,country,timezone`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        city: data.city || 'Unknown',
        region: data.regionName || 'Unknown',
        country: data.country || 'Unknown',
        timezone: data.timezone || 'UTC',
      };
    } else {
      console.log('⚠️ IP Geolocation failed:', data.message);
      return {
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        timezone: 'UTC',
      };
    }
  } catch (error) {
    console.error('❌ Location service error:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      timezone: 'UTC',
    };
  }
}

// Get user's local time
export function getLocalTime(timezone) {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return now.toLocaleTimeString('en-US', options);
  } catch {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}

// Get formatted date
export function getFormattedDate(timezone) {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return now.toLocaleDateString('en-US', options);
  } catch {
    return new Date().toLocaleDateString('en-US');
  }
}

// Get day of week
export function getDayOfWeek(timezone) {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone || 'UTC',
      weekday: 'long',
    };
    return now.toLocaleDateString('en-US', options);
  } catch {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }
}