'use client'

import { UserButton, useAuth, useUser } from '@clerk/nextjs'
import {
	Button,
	Modal,
	ModalContent,
	Spacer,
	useDisclosure,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	Input,
	Chip,
	Divider,
} from '@nextui-org/react'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { FileUp, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CldUploadButton } from 'next-cloudinary'
import { Topic } from '@/util/type'
import TicketTopic from './components/TicketTopic'

export default function Home() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const [content, setContent] = useState('')
	const [options, setOptions] = useState<string[]>([])
	const [currentOption, setCurrentOption] = useState('')
	const [images, setImages] = useState<string[]>([])

	const [topics, setTopics] = useState<Topic[]>([])

	const { userId } = useAuth()
	const avatar = useUser().user?.imageUrl

	useEffect(() => {
		const fetchData = async () => {
			const result = await fetch(`${process.env.API_ADDRESS}/topic`, {
				cache: 'no-cache',
				method: 'GET',
			})
			const data = await result.json()
			setTopics(data.topics as Topic[])
		}
		fetchData()
	}, [])

	return (
		<div>
			<header className='w-full h-14'>
				<div className='fixed top-4 right-8 flex justify-stretch items-center'>
					<Button color='success' endContent={<Send />} onPress={onOpen}>
						Post
					</Button>
					<Spacer x={4} />
					<ThemeSwitcher />
					<Spacer x={4} />
					<UserButton afterSignOutUrl='/' />
				</div>
			</header>
			<div className='flex items-center justify-center m-4'>
				<main className='flex flex-col items-center justify-center w-full border-x-2 sm:w-full md:w-9/12 lg:w-6/12'>
					<Divider className='my-4' />
					{topics &&
						topics.map((topic) => {
							return <TicketTopic {...topic} key={topic.id} />
						})}
				</main>
			</div>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className='flex flex-col gap-1'>
								Post a Topic
							</ModalHeader>
							<ModalBody>
								<Textarea
									label='Content'
									placeholder='Let us start a topic'
									variant='underlined'
									labelPlacement='outside'
									value={content}
									onValueChange={setContent}
								/>
								<Spacer x={2} />
								<CldUploadButton
									uploadPreset='rvyn2scz'
									onSuccess={(result) => {
										// @ts-ignore
										setImages([...images, result.info.url])
									}}
								>
									<button className='bg-secondary-400 hover:bg-secondary-700 text-white font-bold py-2 px-4 rounded-lg'>
										<div className='flex'>
											<FileUp />
											<span>Upload a Image</span>
										</div>
									</button>
								</CldUploadButton>
								<Spacer x={2} />
								<div className='flex items-center'>
									<Input
										label={'Add Options'}
										variant={'faded'}
										size='sm'
										value={currentOption}
										onValueChange={setCurrentOption}
									/>
									<Spacer y={2} />
									<Button
										color='success'
										onClick={() => {
											setOptions([...options, currentOption])
											setCurrentOption('')
										}}
									>
										Add
									</Button>
								</div>
								<Spacer x={2} />
								<div className='flex gap-2'>
									{options.map((item, index) => {
										return (
											<Chip
												key={index}
												onClose={(e) => {
													setOptions(options.filter((i) => i !== item))
												}}
												variant='flat'
											>
												{item}
											</Chip>
										)
									})}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button color='danger' variant='light' onPress={onClose}>
									Cancel
								</Button>
								<Button
									color='primary'
									onPress={onClose}
									onClick={async () => {
										const result = await fetch(
											process.env.API_ADDRESS + '/topic',
											{
												method: 'POST',
												headers: {
													'Content-Type': 'application/json',
												},
												body: JSON.stringify({
													userId: userId,
													avatar: avatar,
													content: content,
													images: images,
													options: options,
												}),
											}
										)

										const data = (await result.json()) as Topic
										setTopics([...topics, data])
										setContent('')
										setOptions([])
										setCurrentOption('')
										setImages([])
									}}
								>
									Confirm
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	)
}
