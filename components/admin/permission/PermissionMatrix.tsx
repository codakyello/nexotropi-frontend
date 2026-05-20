import React from 'react';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';

const PermissionsMatrix = () => {
  const permissions = [
    {
      feature: 'Edit Hero/Problem Section',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'allowed',
      foundingEngineer: 'denied',
      readOnly: 'denied'
    },
    {
      feature: 'Upload Visuals (Logos/Images)',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'allowed',
      foundingEngineer: 'denied',
      readOnly: 'denied'
    },
    {
      feature: 'Save Drafts',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'allowed',
      foundingEngineer: 'allowed',
      readOnly: 'denied'
    },
    {
      feature: 'Publish Changes',
      superAdmin: 'allowed',
      admin: 'warning',
      contentManager: 'denied',
      foundingEngineer: 'warning',
      readOnly: 'denied'
    },
    {
      feature: 'Approve/Reject Users',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'denied',
      foundingEngineer: 'allowed',
      readOnly: 'denied'
    },
    {
      feature: 'Assign Roles',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'denied',
      foundingEngineer: 'warning',
      readOnly: 'denied'
    },
    {
      feature: 'Deactivate Accounts',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'denied',
      foundingEngineer: 'allowed',
      readOnly: 'denied'
    },
    {
      feature: 'View Audit Logs',
      superAdmin: 'allowed',
      admin: 'allowed',
      contentManager: 'denied',
      foundingEngineer: 'allowed',
      readOnly: 'allowed'
    },
    {
      feature: 'Manage Global Settings',
      superAdmin: 'allowed',
      admin: 'denied',
      contentManager: 'denied',
      foundingEngineer: 'denied',
      readOnly: 'denied'
    }
  ];

  const renderIcon = (status: string) => {
    switch (status) {
      case 'allowed':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'denied':
        return <X className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Permissions Matrix</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                  Feature / Permission
                </th>
                <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                  Super Admin
                </th>
                <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                  Admin
                </th>
                <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                  Content Manager
                </th>
                <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                  Founding Engineer
                </th>
                <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                  Read-Only
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-base text-gray-900">
                    {permission.feature}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderIcon(permission.superAdmin)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderIcon(permission.admin)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderIcon(permission.contentManager)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderIcon(permission.foundingEngineer)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderIcon(permission.readOnly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrix;