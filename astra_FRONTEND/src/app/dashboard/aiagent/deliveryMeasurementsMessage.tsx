import React, { useState, useEffect } from 'react';
import { MapPin, User, Phone, Package, Ruler } from 'lucide-react';

interface DeliveryDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  chatId: string;
  country: string;
  name: string;
  phone: string;
  address: string;
  status: string;
}

interface Measurements {
  id: string;
  createdAt: string;
  updatedAt: string;
  chatId: string;
  neck: string;
  chest: string;
  armLeft: string;
  armRight: string;
  waist: string;
  weight: string;
  hips: string;
  legs: string;
  thighLeft: string;
  thighRight: string;
  calfLeft: string;
  calfRight: string;
}

interface DeliveryMeasurementsData {
  deliveryDetails: DeliveryDetails;
  measurements: Measurements;
}

interface DeliveryMeasurementsMessageProps {
  chatId: string;
  content: string;
  timestamp: string;
  onDataLoad?: (data: DeliveryMeasurementsData) => void;
}

const DeliveryMeasurementsMessage: React.FC<DeliveryMeasurementsMessageProps> = ({
  chatId,
  content,
  timestamp,
  onDataLoad
}) => {
  const [deliveryData, setDeliveryData] = useState<DeliveryMeasurementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';
        const response = await fetch(`${baseUrl}/marketplace/chat/${chatId}/delivery-measurements`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch delivery data');
        }

        const result = await response.json();

        if (result.status && result.data) {
          const data: DeliveryMeasurementsData = result.data;
          setDeliveryData(data);
          onDataLoad?.(data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching delivery data:', err);
        setError('Failed to load delivery and measurement details');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchDeliveryData();
    }
  }, [chatId, onDataLoad]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 max-w-md">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span>Loading delivery details...</span>
        </div>
      </div>
    );
  }

  if (error || !deliveryData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
        <p className="text-red-600 text-sm">{error || 'Unable to load delivery details'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Delivery & Measurements
        </h3>
        <p className="text-sm text-gray-600">{content}</p>
      </div>

      {/* Delivery Details */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Delivery Information
        </h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{deliveryData.deliveryDetails.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{deliveryData.deliveryDetails.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Country:</span>
            <span className="font-medium">{deliveryData.deliveryDetails.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Address:</span>
            <span className="font-medium text-right">{deliveryData.deliveryDetails.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium capitalize ${
              deliveryData.deliveryDetails.status === 'pending' ? 'text-yellow-600' :
              deliveryData.deliveryDetails.status === 'shipped' ? 'text-blue-600' :
              deliveryData.deliveryDetails.status === 'delivered' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {deliveryData.deliveryDetails.status}
            </span>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className="p-3 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Body Measurements (cm)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Neck:</span>
            <span className="font-medium">{deliveryData.measurements.neck}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chest:</span>
            <span className="font-medium">{deliveryData.measurements.chest}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Waist:</span>
            <span className="font-medium">{deliveryData.measurements.waist}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hips:</span>
            <span className="font-medium">{deliveryData.measurements.hips}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium">{deliveryData.measurements.weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Left Arm:</span>
            <span className="font-medium">{deliveryData.measurements.armLeft}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Right Arm:</span>
            <span className="font-medium">{deliveryData.measurements.armRight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Left Thigh:</span>
            <span className="font-medium">{deliveryData.measurements.thighLeft}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Right Thigh:</span>
            <span className="font-medium">{deliveryData.measurements.thighRight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Left Calf:</span>
            <span className="font-medium">{deliveryData.measurements.calfLeft}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Right Calf:</span>
            <span className="font-medium">{deliveryData.measurements.calfRight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Legs:</span>
            <span className="font-medium">{deliveryData.measurements.legs}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        {timestamp}
      </div>
    </div>
  );
};

export default DeliveryMeasurementsMessage;
