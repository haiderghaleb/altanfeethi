import { Clock, User, ShoppingBag, CreditCard } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'user',
    title: 'New user registered',
    description: 'John Doe joined the platform',
    time: '2 minutes ago',
    icon: User,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 2,
    type: 'order',
    title: 'New order received',
    description: 'Order #1234 for $299.99',
    time: '5 minutes ago',
    icon: ShoppingBag,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    id: 3,
    type: 'payment',
    title: 'Payment processed',
    description: 'Payment of $149.99 completed',
    time: '10 minutes ago',
    icon: CreditCard,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: 4,
    type: 'user',
    title: 'User updated profile',
    description: 'Jane Smith updated her information',
    time: '15 minutes ago',
    icon: User,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 5,
    type: 'order',
    title: 'Order shipped',
    description: 'Order #1230 has been shipped',
    time: '1 hour ago',
    icon: ShoppingBag,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = activity.icon;
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.iconBg}`}>
                          <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}