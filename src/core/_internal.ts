import {
	Function,
} from 'ts-toolbelt/out/Function/_api';

import { EventEmitter } from 'stream';

export namespace Strings {

	export type PrefixName<
		NameString extends string=string,
	> = NameString extends `${infer s_0}:${infer s_1}`
		? never
		: NameString;
}


export namespace RDFJS {
	export interface Quad {}

	export interface NamedNode {}

	export type StreamEvents<
		DataType extends Quad=Quad,
	> = {
		readable: [];
		end: [];
		error: [Error];
		data: [Quad];
		prefix: [Strings.PrefixName, NamedNode];
	}

	export type StreamEventKey = keyof StreamEvents;
	
	type Listener<
		Event extends string,
	> = Event extends StreamEventKey
		? (...a_args: StreamEvents[Event]) => void
		: CallableFunction;
	
	type EmitArgs<
		Event extends string,
	> = Event extends StreamEventKey
		? StreamEvents[Event]
		: any[];
	
	export interface Stream<
		DataType extends Quad=Quad,
	> extends EventEmitter {
		read(): DataType;

		on<
			Event extends string,
		>(s_event: Event, f_listener: Listener<Event>): this;

		addEventListener<
			Event extends string,
		>(s_event: Event, f_listener: Listener<Event>): this;

		once<
			Event extends string,
		>(s_event: Event, f_listener: Listener<Event>): this;

		emit<
			Event extends string,
		>(s_event: Event, ...a_args: EmitArgs<Event>): boolean;

		off<
			Event extends string
		>(s_event: Event, f_listener: Listener<Event>) : this;
	}
}

export namespace Stream {
	export type Encoding_UTF8 = 'utf-8' | 'utf8';
	export type Encoding_Buffer = 'buffer';
	export type Encoding_Objects = void | null;
	export type ValidEncoding = Encoding_UTF8 | Encoding_Buffer | Encoding_Objects;

	interface BucketMethod {
		bucket<
			ObjectType extends any=unknown,
			Encoding extends ValidEncoding=Encoding_Objects,
		>(s_encoding?: Encoding): Encoding extends Encoding_UTF8
			? Promise<string>
			: (Encoding extends Encoding_Buffer
				? Promise<Buffer>
				: Promise<ObjectType[]>
			);
	}

	interface ImportMethod {
		import(ds_input: RDFJS.Stream): this;
	}

	export interface Readable<
		Encoding extends ValidEncoding=Encoding_Buffer,
		ObjectType extends any=unknown,
	> extends BucketMethod, ImportMethod, RDFJS.Stream {
		
	}

	export interface StaticReadable {
		fromData(w_push: any, s_encoding?: ValidEncoding): Readable;
	}

	export declare var Readable: StaticReadable;

	// type DEMO = Readable['bucket']<'utf8'>
	(async() => {
		let F!: Readable;
		const S = await F.bucket('buffer');
		F.emit('data', 'hi');
	})();
}
