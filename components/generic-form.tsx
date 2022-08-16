import { FieldValues, useForm, UseFormRegister } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSWR from 'swr';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { ApiResponse } from '../lib/models';

// All values that come from useForm, to be used in our custom forms
export type FormProps = {
  register: UseFormRegister<FieldValues>;
  isSubmitting: boolean;
  errors: { [error: string]: any };
};

type Props = {
  url: string;
  renderForm: (formProps: FormProps) => React.ReactNode;
  /* If True, will make GET call to url to preload form data */
  preload?: boolean;
};

const fetcher = (url: string, preload: boolean) => preload ? fetch(url).then((r) => r.json()) : {data: null};

async function saveFormData(data: object, url: string) {
  return await fetch(url, {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

export function useConfirmRedirectIfDirty(isDirty: boolean) {
  const router = useRouter();

  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (!isDirty) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [isDirty]);
}

function GenericForm({ url, renderForm, preload = false }: Props) {
  // Fetch our initial form data
  const { data, error } = useSWR(url, () => fetcher(url, preload));
  const {
    register,
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors, isDirty },
  } = useForm();

  // Confirm redirects when isDirty is true
  useConfirmRedirectIfDirty(isDirty);

  // Submit handler which displays errors + success messages to the user
  const onSubmit = async (data: object) => {
    const response = await saveFormData(data, url);

    if (response.status === 400) {
      // Validation error, expect response to be a JSON response {"field": "error message for that field"}
      const fieldToErrorMessage: { [fieldName: string]: string } =
        await response.json();
      for (const [fieldName, errorMessage] of Object.entries(
        fieldToErrorMessage,
      )) {
        setError(fieldName, { type: 'custom', message: errorMessage });
      }
    } else if (response.status === 401 || response.status === 403) {
      const res = (await response.json()) as ApiResponse;
      toast.error(res.message);
    } else if (response.ok) {
      const res = (await response.json()) as ApiResponse;
      // successful
      toast.success(res.message);
    } else {
      // unknown error
      toast.error(
        'An unexpected error occurred while saving, please try again',
      );
    }
  };

  // Sets the default value of the form once it's available
  useEffect(() => {
    if (data === undefined) {
      return; // loading
    }
    reset(data);
  }, [reset, data]);

  // Handle errors + loading state
  if (error) {
    return <div>An unexpected error occurred while loading, please try again</div>;
  } else if (!data) {
    return <div>Loading...</div>;
  }

  // Finally, render the form itself
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {renderForm({ register, errors, isSubmitting })}
      <ToastContainer position="bottom-center" />
    </form>
  );
}

export default GenericForm;
