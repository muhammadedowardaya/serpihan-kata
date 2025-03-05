import React from 'react';

import FormPost from '@/components/FormPost';

const CreateNewPostPage = () => {
	return (
		<div>
			<h1 className="text-2xl font-bold my-4">Create New Post</h1>
			<FormPost defaultValues={null} />
		</div>
	);
};

export default CreateNewPostPage;
