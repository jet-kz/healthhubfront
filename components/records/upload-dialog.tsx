"use client"

import { useState } from "react"
import { useUploadRecord } from "@/hooks/queries"
import { useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SingleFileDropzone } from "@/components/ui/single-file-dropzone"
import { useEdgeStore } from "@/lib/edgestore"

export function UploadRecordDialog({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState("")
    const [type, setType] = useState("History")
    const [file, setFile] = useState<File>()
    const [isOpen, setIsOpen] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const queryClient = useQueryClient()
    const { mutate: uploadRecord, isPending } = useUploadRecord()
    const { edgestore } = useEdgeStore()

    const handleUpload = async () => {
        if (!title || !file) return;

        setIsUploading(true)

        try {
            // 1. Upload file to EdgeStore
            const res = await edgestore.publicFiles.upload({
                file,
                onProgressChange: (progress) => {
                    setUploadProgress(progress)
                },
            })

            // 2. Save record to backend
            uploadRecord({
                title,
                document_type: type,
                document_url: res.url,
                description: "Uploaded by patient"
            }, {
                onSuccess: () => {
                    setIsOpen(false)
                    setTitle("")
                    setFile(undefined)
                    setUploadProgress(0)
                    queryClient.invalidateQueries({ queryKey: ['patient-records'] })
                }
            })
        } catch (err) {
            console.error("Failed to upload document", err)
            // Error handling could go here
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Record</DialogTitle>
                    <DialogDescription>
                        Add a new medical document to your records.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Vaccination Certificate"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Document Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="History">Medical History</SelectItem>
                                <SelectItem value="Lab Result">Lab Result</SelectItem>
                                <SelectItem value="Prescription">Prescription</SelectItem>
                                <SelectItem value="Insurance">Insurance</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Document File</Label>
                        <SingleFileDropzone
                            width={375}
                            height={150}
                            value={file}
                            onChange={(file) => setFile(file)}
                        />
                        {isUploading && (
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div 
                                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpload} disabled={!title || !file || isPending || isUploading}>
                        {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload File
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
