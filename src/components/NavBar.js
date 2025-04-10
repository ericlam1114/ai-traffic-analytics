'use client';

import { useAuth } from '../lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { getUserWebsites } from '@/lib/supabase';
import { 
  BarChart, 
  TrendingUp, 
  Globe, 
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NavBar({ 
  selectedWebsite, 
  setSelectedWebsite,
  timeRange,
  setTimeRange,
  websites = [],
  setWebsites = () => {},
  isWebsitesLoaded = false
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user && !isWebsitesLoaded) {
      fetchWebsites();
    }
  }, [user, isWebsitesLoaded]);

  const fetchWebsites = async () => {
    try {
      const { data, error } = await getUserWebsites(user.uid);
      if (error) throw error;
      setWebsites(data || []);
      if (data && data.length > 0 && !selectedWebsite) {
        setSelectedWebsite(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    }
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      current: pathname === '/dashboard',
      icon: <BarChart className="w-4 h-4 mr-2" />
    },
    { 
      name: 'Trends', 
      href: '/trends', 
      current: pathname === '/trends',
      icon: <TrendingUp className="w-4 h-4 mr-2" />
    },
    { 
      name: 'Websites', 
      href: '/websites', 
      current: pathname === '/websites' || pathname.startsWith('/websites/'),
      icon: <Globe className="w-4 h-4 mr-2" />
    },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-100">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/parsleyanalytics.png"
                      alt="Parsley Analytics Logo"
                      width={150}
                      height={150}
                      className="mr-2"
                      style={{ filter: 'brightness(0) saturate(100%) invert(42%) sepia(68%) saturate(3619%) hue-rotate(146deg) brightness(95%) contrast(101%)' }}
                    />
                  </Link>
                </div>
                {user && (
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'border-emerald-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {user && websites.length > 0 && (pathname === '/dashboard' || pathname === '/trends') && (
                <div className="hidden sm:flex items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="cursor-pointer relative w-56">
                        <select 
                          id="website-select"
                          className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
                          value={selectedWebsite || ""}
                          onChange={(e) => setSelectedWebsite(e.target.value)}
                        >
                          {websites.map((site) => (
                            <option key={site.id} value={site.id}>
                              {site.name || site.domain}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                {user ? (
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center'
                                )}
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <div className="flex flex-row space-x-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center px-2 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-supabase-green hover:bg-supabase-green"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            {user && (
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center'
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Disclosure.Button>
                ))}
                
                {websites.length > 0 && (pathname === '/dashboard' || pathname === '/trends') && (
                  <div className="pl-3 pr-4 py-2">
                    <div className="relative w-full">
                      <select
                        id="mobile-website-select"
                        className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                        value={selectedWebsite || ""}
                        onChange={(e) => setSelectedWebsite(e.target.value)}
                      >
                        {websites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name || site.domain}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                        {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Disclosure.Button
                      as="button"
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3">
                  <div className="flex space-x-2 px-4">
                    <Disclosure.Button
                      as="a"
                      href="/login"
                      className="flex-1 block px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center rounded-md"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Sign in
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="a"
                      href="/signup"
                      className="flex-1 block px-3 py-2 text-xs font-medium bg-supabase-green text-white rounded-md hover:bg-supabase-dark-green flex items-center justify-center shadow-sm"
                    >
                      Sign up
                    </Disclosure.Button>
                  </div>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}