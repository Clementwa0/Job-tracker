
import React, { useState } from 'react';
import PageLayout from '../components/layouts/PageLayout';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: 'Job Seeker',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user profile here
    console.log('Updated profile:', formData);
    setIsEditing(false);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-border">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-semibold">Personal Information</h2>
          </div>
          
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.name}</div>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.email}</div>
                  )}
                </div>
                
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="role"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.role}</div>
                  )}
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.phone || 'Not provided'}</div>
                  )}
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{formData.location || 'Not provided'}</div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="font-medium mb-4">Social Profiles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="linkedin"
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formData.linkedin ? (
                          <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {formData.linkedin}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* GitHub */}
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub Profile
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="github"
                        id="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formData.github ? (
                          <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {formData.github}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Portfolio */}
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="portfolio"
                        id="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formData.portfolio ? (
                          <a href={formData.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {formData.portfolio}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg border border-border">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-semibold">Account Settings</h2>
          </div>
          
          <div className="px-6 py-5">
            <div className="space-y-6">
              {/* Change Password (mock) */}
              <div>
                <h3 className="text-sm font-medium text-gray-700">Password</h3>
                <p className="mt-1 text-sm text-gray-500">Update your password to keep your account secure.</p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Change Password
                </button>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Delete Account</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-destructive hover:bg-destructive/90"
                  onClick={() => {
                    // For demo purposes, just log out instead of deleting the account
                    if (window.confirm('For this demo, clicking "Delete Account" will just log you out. Continue?')) {
                      logout();
                    }
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
