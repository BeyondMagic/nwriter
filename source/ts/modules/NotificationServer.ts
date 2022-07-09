import svg_arrow_right from '../../icons/keyboard_arrow_right.svg'
import svg_clear_all from '../../icons/clear_all.svg'
import svg_notification from '../../icons/notifications.svg'
import svg_settings from '../../icons/settings.svg'

interface Button {

  readonly name   : string
  readonly action : Function
  readonly level  : 'accept' | 'alternate'
  readonly icon?  : SVGSVGElement | null

}

interface NotificationIcon {

  element : SVGSVGElement | null
  readonly name    : string

}

// #. For history.
export interface NotificationHistoryItem {

  level    : 'urgent' | 'normal' | 'low'
  text     : string
  title    : string
  snapshot : number

  icon? : NotificationIcon

}

// #. For modules who has their own notification system
export interface NotificationInit {

  readonly level : 'urgent' | 'normal' | 'low'
  readonly text  : string

  readonly icon? : NotificationIcon

  readonly buttons? : Array<Button>

  time? : number

}

export interface NotificationType extends NotificationInit {

  readonly title : string

}

export class NotificationServer {

  private parent       : HTMLElement
  private sidebar      : HTMLElement
  private sidebar_body : HTMLElement
  private history      : Array<NotificationHistoryItem>
  private history_file : string
  private directory    : string

  public constructor ( parent : HTMLElement, directory : string = WhiteDove.system.data_path, file : string = '/history.json' ) {

    const container = document.createElement('main')
    {
      container.classList.add('notification-container')
    }
    parent.appendChild(container)

    const page = document.createElement('main')
    {
      page.classList.add('notification-page')
    }
    document.body.append(page)

    this.sidebar_body = document.createElement('section')
    this.sidebar      = page
    this.parent       = container
    this.history_file = directory + file
    this.directory    = directory
    this.history      = []

  }

  /**
    * Save the notification to the history variable of NotificationServer.
    * @param NotificationType Data of the notification to save.
    * @example
    *   this.save(notification_data)
    */
  private async save ( data : NotificationType, snapshot : number ) : Promise<void> {

    const notification : NotificationHistoryItem = {

      level     : data.level,
      text      : data.text,
      title     : data.title,
      snapshot  : snapshot,

    }

    if (data.icon) {

      notification.icon = {

        name    : data.icon.name,
        element : data.icon.element,

      }

    }

    this.history.push(notification)
    this.sidebar_body.insertAdjacentElement( 'afterbegin', this.create_notification(notification, snapshot, false) )

  }

  /**
    * Notify from this module with the default settings and without saving to history.
    * @param NotificationInit The initial notification to load.
    * @example
    *   this.notify({ text: 'lol', '' })
    */
  private notify ( data : NotificationInit ) : void {

    this.create({

      title   : 'NotificationServer',
      text    : data.text,
      level   : data.level,
      buttons : data.buttons,
      icon    : {

        element: WhiteDove.createIcon(svg_notification),
        name: 'notification_server'

      }

    }, false)

  }

  /**
    * Add each notifcation from `this.history` and then add it to the sidebar.
    * Just run this once.
    * @example
    *   await this.create_side_bar()
    */
  private async create_side_bar () : Promise<void> {

    this.sidebar.classList.add('hidden')

    const header = document.createElement('section')
    {
      header.classList.add('header')

      // 1. Left part of the header.
      const left = document.createElement('section')
      {
        left.classList.add('left')

        // 1.1. Add a text for `Notifications`.
        const label = document.createElement('span')
        {
          label.textContent = 'Notifications'
          label.classList.add('label')
          left.appendChild(label)
        }
      }
      header.appendChild(left)

      // 2.1. Right part of the header.
      const right = document.createElement('section')
      {
        right.classList.add('right')
        const clear = document.createElement('span')
        {
          clear.classList.add('clear', 'button')

          clear.addEventListener('click', () => console.log('aaaaaaaaa') )

          const icon = WhiteDove.createIcon(svg_clear_all)
          if (icon) {

            icon.classList.add('icon')
            clear.appendChild(icon)

          }
        }

        // 2.2. This symbol is used to open the configuration page of the NotificationServer.
        const config = document.createElement('span')
        {
          config.classList.add('config', 'button')

          config.addEventListener('click', () => this.show_config_page() )

          const icon = WhiteDove.createIcon(svg_settings)
          if (icon) {

            icon.classList.add('icon')
            config.appendChild(icon)

          }
        }
        right.append(clear, config)

      }
      header.appendChild(right)

    }

    const list = this.sidebar_body
    {
      list.classList.add('notification-list')

      this.history.forEach( item => {

        const notification = this.create_notification(item, item.snapshot)

        list.insertAdjacentElement( 'afterbegin', notification)

      })
    }

    this.sidebar.append(header, list)

  }

  /**
    * Create the element of notification given the data.
    * @param data NotificationType | NotificationHistoryItem The data of the notificaiton to be created in a HTML element.
    * @example
    *   const notification = this.create_notification(data)
    *   notification.classList.add('mine-special')
    */
  private create_notification ( data : NotificationType | NotificationHistoryItem, snapshot : number, save : boolean = false ) : HTMLElement {

    const notification = document.createElement('section')
    {

      notification.classList.add('notification', data.level)

      const header = document.createElement('section')
      {
        header.classList.add('header')

        const button = document.createElement('span')
        {

          button.classList.add('button')
          button.addEventListener( 'click', () => this.remove( data, snapshot, notification, save) )

          const icon = WhiteDove.createIcon(svg_arrow_right)
          if (icon) {

            icon.classList.add('close')
            button.append(icon)

          }

          header.append(button)
        }
      }

      const date = document.createElement('section')
      {
        date.classList.add('date')
        date.textContent = WhiteDove.timeParser.parse(snapshot)
      }

      if (data.icon && data.icon.element) {

        const icon = document.createElement('section')
        {
          icon.classList.add('icon-container')
          const box = document.createElement('span')
          {
            box.classList.add('icon-box', data.icon.name)
            data.icon.element.classList.add('icon')
            box.append(data.icon.element)
          }
          icon.append(box)
        }

        notification.append(icon)
      }

      const title = document.createElement('section')
      {
        title.classList.add('title')

        {
          const name = document.createElement('span')
          name.classList.add('name')
          name.textContent = data.title
          title.append(name)
        }
      }

      const body = document.createElement('section')
      {
        body.classList.add('body')
        body.insertAdjacentHTML('beforeend', data.text)
      }

      if ('buttons' in data && data.buttons) {

        const buttons = document.createElement('section')

        buttons.classList.add('buttons')

        data.buttons.forEach( item => {

          const button = document.createElement('span')

          {
            button.classList.add('button', item.level)
            button.addEventListener( 'click', () => {

              const new_data = data
              new_data.time = 0

              this.remove(new_data, snapshot, notification, save)
              item.action()

            })
          }

          if (item.icon) {

            item.icon.classList.add('icon')
            button.append(item.icon)

          }

          {
            const text   = document.createElement('span')
            text.textContent = item.name
            text.classList.add('name')
            button.append(text)
          }

          buttons.append(button)

        })

        notification.append(buttons)
      }

      notification.append(header, title, body, date)
    }

    return notification

  }

  public async create ( data : NotificationType, save : boolean = true ) : Promise<HTMLElement> {

    // #. Calculate the time of the notifcation by its level.
    if (!data.time) {

      switch (data.level) {

        // 1. Will be here forever (infinite).
        case 'urgent': data.time = -1; break

        // 2. Set for 5 seconds.
        case 'normal': data.time = 5000; break

        // 3. Set for 2.5 seconds.
        case 'low':    data.time = 2500; break

      }

    }

    const snapshot = +new Date()
    const notification = this.create_notification(data, snapshot, save)

    this.parent.appendChild(notification)

    // #. To remove the notification after a few seconds.
    if (data.time > 0) this.remove(data, snapshot, notification, save)

    return notification

  }

  public async remove ( data : NotificationType, snapshot : number, notification : HTMLElement, save : boolean ) : Promise<void> {

    // #. Just a little test to make sure it's a notification.
    //    Not so sure though.
    if (!notification.classList.contains('notification')) return

    // #. Parse the seconds computed CSS of transition and then make it in miliseconds.
    let transition_time = parseFloat((getComputedStyle(notification).getPropertyValue('transition-duration').slice(0, -1)))
    {
      transition_time *= 1000

      data.time! -= transition_time
    }

    if (data.time! > 0) await WhiteDove.sleep(data.time!)

    notification.classList.add('remove')

    await WhiteDove.sleep(transition_time)

    notification.remove()

    // #. See if we can save it.
    if (save) this.save(data, snapshot)

  }

  public async backup () : Promise<boolean> {

    // #. To change the `icon.element` of the notification to a string that can be saved in the file.
    const history_string = this.history.map( item => {

      if (item.icon && item.icon.element) item.icon.element = item.icon.element.outerHTML as any

      return item

    })

    return Neutralino.filesystem.writeFile(this.history_file, JSON.stringify(history_string, null, 2)).then( () => {

      this.notify({
        text  : `History file saved`,
        level : 'low'
      })

      return true

    }).catch( error => {

      if ('code' in error) {

        this.notify({
          text  : `Failed to save history file`,
          level : 'urgent',
          // TODO: Buttons to retry.
        })

      }

      console.error(error)

      return false

    })

  }

  public async parse () : Promise<void> {

    // #. Parse each notification.
    this.history = await Neutralino.filesystem.readFile(this.history_file).then( data => {

      const unparsed_history = JSON.parse(data) as Array<NotificationHistoryItem>

      const parsed_history = unparsed_history.map( (item, index) => {

        const msg = `The notification [${index}]`

        {
          if (!('level' in item)) throw `${msg} does not have the property 'level'.`

          // #. Make sure the level can exist.
          {
            let strange_level = false

            Array.from(['urgent', 'normal', 'low']).forEach( level => {

                strange_level = (level === item.level)

            })

            if (strange_level) throw `${msg} has a unrecognised level.`
          }

          if (!('text' in item && typeof item.text === 'string')) throw `${msg} text property does not exist or it's not a string.`

          if ('icon' in item && item.icon) {

            if (typeof item.icon.name !== 'string') throw `${msg} the name property of icon is not a string!`

            if (typeof item.icon.element !== 'string') throw `${msg} the element property of icon is not an string!`

          }

        }

        // 1. Garbage collector lul.
        const notification : NotificationHistoryItem = {

          level    : item.level,
          text     : item.text,
          title    : item.title,
          snapshot : item.snapshot,

        }

        // 1.1. Return the item with icon.
        if (item.icon) {

          notification.icon = {

            element : WhiteDove.createIcon(String(item.icon.element)),
            name    : item.icon.name,

          }

        }

        return notification

      })

      return parsed_history

    }).catch( error => {

      // #. Create the folder and file if not found.
      if (error.code === 'NE_FS_FILRDER') {

        Neutralino.filesystem.createDirectory(this.directory)

        Neutralino.filesystem.writeFile(this.history_file, JSON.stringify([], null, 2)).then( () => {

          this.notify({
            text  : `Created the history file on <b>${this.history_file}</b>`,
            level : 'urgent'
          })

        })
      }

      //this.notify
      console.error(error)

      return [] as Array<NotificationHistoryItem>

    })

    // #. Add to the sidebar.
    await this.create_side_bar()

  }

  public show_config_page () : void {

    console.log('うあっ')

  }

  public show_sidebar ( button : HTMLElement ) : void {

    if (this.sidebar.classList.contains('hidden')) {

      this.sidebar.classList.remove('hidden')
      button.classList.add('active')

    } else {

      this.sidebar.classList.add('hidden')
      button.classList.remove('active')

    }

  }

}
