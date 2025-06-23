import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { botttsNeutral, initials } from "@dicebear/collection"
import { createAvatar } from "@dicebear/core";

interface GeneratedAvatarProps {
    seed: string
    className?: string
    variant: "botttsNeutral" | "initials"
}

import React from 'react'

const GeneratedAvatar = ({
    seed,
    className,
    variant
}: GeneratedAvatarProps) => {

    let avatar;
    if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, { seed })
    } else {
        avatar = createAvatar(initials, {
            seed,
            fontWeight: 400,
            fontSize: 42
        })
    }

    return (
        <Avatar className={cn(className)}>
            <AvatarImage src={avatar.toDataUri()} alt="Avatar" />
            <AvatarFallback>
                {seed.charAt(0).toLocaleLowerCase()}
            </AvatarFallback>
        </Avatar>
    )
}

export default GeneratedAvatar